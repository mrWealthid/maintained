"use client";
import React, {
  cloneElement,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { createContext } from "react";
import {
  IListResponse,
  ITableProps,
  TableColumn,
  IsearchParams,
  IselectOptions,
  TableFilterField,
  TableFilterFieldRenderProps,
  TableContextType,
  TableSortType,
} from "./models/table.model";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useTable } from "./hooks/useTable";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import Search from "../search/Search";
import Empty from "../empty/Empty";
import AnimatedBorderWrapper from "../animation/AnimatedBorder";
import {
  Table,
  TableBody,
  // TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Funnel, FunnelX, RotateCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { useTableExport } from "./hooks/use-table-export";
import {
  TABLE_EXPORT_MAX_ROWS,
  TABLE_EXPORT_SCOPE,
  type TableExportScope,
} from "./models/table-export.model";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TableVisualizeSheet from "./TableVisualizeSheet";
import { getValueByAccessor } from "./helpers/table-value.helper";
import {
  createProgressToast,
  downloadBlob,
} from "@/shared/lib/resource-download";

const TableContext = createContext<TableContextType<unknown> | undefined>(
  undefined,
);

const TABLE_FILTER_CLEAR_VALUE = "__all__";
const TABLE_SORT_DIRECTION_ASC = "asc";
const TABLE_SORT_DIRECTION_DESC = "desc";

function useTypedTableContext<T>() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error("Table components must be used within TableComponent");
  }
  return ctx as TableContextType<T>;
}

function normalizeExportText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" • ");
}

function formatExportCellValue(value: unknown): string {
  if (value == null) return "--";
  if (typeof value === "string") {
    const normalized = normalizeExportText(value);
    return normalized || "--";
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    const serialized = value
      .map((item) => formatExportCellValue(item))
      .filter((item) => item !== "--")
      .join(", ");
    return serialized || "--";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function humanizeQueryKey(queryKey: string) {
  return queryKey
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function slugifyFileName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "table-export"
  );
}

function removeEmptySearchValues(data: IsearchParams) {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== "" && value != null && !(typeof value === "number" && Number.isNaN(value)),
    ),
  );
}

function buildFilterFieldsFromColumns(
  columns: TableColumn<unknown>[],
): TableFilterField[] {
  return columns
    .filter((column) => column.searchType)
    .map((column) => ({
      key: column.filterKey ?? column.header,
      label: column.header,
      searchType: column.searchType!,
      selectOptions: column.selectOptions,
    }));
}

function hasActiveFilterFields(
  search: IsearchParams | null | undefined,
  filterFields: TableFilterField[],
) {
  if (!search) {
    return false;
  }

  return filterFields.some((field) => {
    const value = search[field.key];
    return (
      value !== "" &&
      value != null &&
      !(typeof value === "number" && Number.isNaN(value))
    );
  }) || typeof search.sort === "string" && search.sort.trim().length > 0;
}

function parseSortValue(sort: unknown) {
  if (typeof sort !== "string" || !sort.trim()) {
    return {
      sortField: "",
      sortDirection: TABLE_SORT_DIRECTION_DESC,
    };
  }

  const normalizedSort = sort.trim();
  const isDesc = normalizedSort.startsWith("-");

  return {
    sortField: isDesc ? normalizedSort.slice(1) : normalizedSort,
    sortDirection: isDesc
      ? TABLE_SORT_DIRECTION_DESC
      : TABLE_SORT_DIRECTION_ASC,
  };
}

function buildSortValue(sortField: unknown, sortDirection: unknown) {
  if (typeof sortField !== "string" || !sortField.trim()) {
    return "";
  }

  const normalizedField = sortField.trim();
  return sortDirection === TABLE_SORT_DIRECTION_ASC
    ? normalizedField
    : `-${normalizedField}`;
}

type TableSortOption = {
  name: string;
  value: string;
  sortType: TableSortType;
};

function inferSortType(column: TableColumn<unknown>): TableSortType {
  if (column.sortType) {
    return column.sortType;
  }

  const source = `${String(column.header ?? "")} ${String(column.accessor ?? "")}`.toLowerCase();

  if (
    /\b(date|time|created|updated|paid|start|end|scheduled|deadline|window)\b/.test(
      source,
    )
  ) {
    return "date";
  }

  if (
    /\b(amount|price|capacity|count|total|qty|quantity|tickets|guests|hours|rate|percent|percentage|revenue|seats|spots|attendees|volunteers)\b/.test(
      source,
    )
  ) {
    return "number";
  }

  return "string";
}

function getSortDirectionOptions(sortType: TableSortType): IselectOptions[] {
  if (sortType === "date") {
    return [
      { name: "Newest first", value: TABLE_SORT_DIRECTION_DESC },
      { name: "Oldest first", value: TABLE_SORT_DIRECTION_ASC },
    ];
  }

  if (sortType === "number") {
    return [
      { name: "Highest first", value: TABLE_SORT_DIRECTION_DESC },
      { name: "Lowest first", value: TABLE_SORT_DIRECTION_ASC },
    ];
  }

  return [
    { name: "A to Z", value: TABLE_SORT_DIRECTION_ASC },
    { name: "Z to A", value: TABLE_SORT_DIRECTION_DESC },
  ];
}

function buildSortableOptions(columns: TableColumn<unknown>[]) {
  const seen = new Set<string>();

  return columns
    .map((column) => {
      const accessor = String(column.accessor ?? "").trim();
      if (!accessor || accessor === ".") {
        return null;
      }

      if (seen.has(accessor)) {
        return null;
      }

      seen.add(accessor);

      const option: TableSortOption = {
        name: column.header,
        value: accessor,
        sortType: inferSortType(column),
      };
      return option;
    })
    .filter((option): option is TableSortOption => option !== null);
}

function TableComponent<T>({
  queryKey,
  children,
  columns,
  filterFields,
  exportTitle,
  headerActions,
  service,
  limit: limitVal,
  actionable = true,
  isDownloadable = true,
  defaultParams,
  searchKey,
  enableSelection = false,
  getRowId,
  onSelectionChange,
  renderSelectionActions,
}: ITableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(limitVal || 5);
  const [search, setSearch] = useState<IsearchParams | null>(
    defaultParams ?? null,
  );
  const resolvedFilterFields = useMemo<TableFilterField[]>(
    () =>
      filterFields?.length
        ? filterFields
        : buildFilterFieldsFromColumns(columns as TableColumn<unknown>[]),
    [columns, filterFields],
  );
  const filterIsActive = useMemo(
    () => hasActiveFilterFields(search, resolvedFilterFields),
    [resolvedFilterFields, search],
  );

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set(),
  );

  const {
    isLoading,
    // error,
    data = [],
    summary,
    totalRecords,
    // results,
    isRefetching,
    reload,
  }: IListResponse<T> = useTable<T>(page, limit, service, queryKey, search);



  // --- actions (memoize) ---
  const updateLimit = React.useCallback((n: number) => setLimit(n), []);
  const handlePaginate = React.useCallback((page: number, limit: number) => {
    setPage(page);
    setLimit(limit);
  }, []);
  const onFilter = React.useCallback((val: IsearchParams | null) => {
    if (!val) {
      setSearch(null);
      setPage(1);
      return;
    }

    const nextSearch = { ...(search ?? {}) };

    Object.entries(val).forEach(([key, value]) => {
      if (
        value === "" ||
        value == null ||
        (typeof value === "number" && Number.isNaN(value))
      ) {
        delete nextSearch[key];
        return;
      }

      nextSearch[key] = value;
    });

    const hasSearchParams = Object.keys(nextSearch).length > 0;

    setSearch(hasSearchParams ? nextSearch : null);
    setPage(1);
  }, [search]);

  const cancelFilter = React.useCallback(() => {
    const nextSearch = { ...(search ?? {}) };

    resolvedFilterFields.forEach((field) => {
      delete nextSearch[field.key];
    });

    setSearch(Object.keys(nextSearch).length ? nextSearch : null);
    setPage(1);
  }, [resolvedFilterFields, search]);

  const tableRef = useRef<HTMLTableElement | null>(null);

  const getRowIdForRow = React.useCallback(
    (row: T, index: number) => {
      if (getRowId) return getRowId(row, index);
      return index;
    },
    [getRowId],
  );

  const toggleRowSelection = React.useCallback((id: string | number) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  const selectAllOnPage = React.useCallback(() => {
    if (!data || data.length === 0) {
      setSelectedRowIds(new Set());
      return;
    }
    const all = new Set<string | number>();
    data.forEach((row, index) => {
      all.add(getRowIdForRow(row, index));
    });
    setSelectedRowIds(all);
  }, [data, getRowIdForRow]);

  const isRowSelected = React.useCallback(
    (id: string | number) => selectedRowIds.has(id),
    [selectedRowIds],
  );

  const selectedRows: T[] = useMemo(() => {
    if (!data || !enableSelection) return [];
    const rows: T[] = [];
    data.forEach((row, index) => {
      const id = getRowIdForRow(row, index);
      if (selectedRowIds.has(id)) rows.push(row);
    });
    return rows;
  }, [data, enableSelection, getRowIdForRow, selectedRowIds]);

  const hasSelection = selectedRows.length > 0;

  useEffect(() => {
    if (onSelectionChange && enableSelection) {
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange, selectedRows, enableSelection]);

  const CardContent = (
    <div className="bg-card/80 backdrop-blur-xs p-3 border border-border/80 rounded-xl space-y-3">
      <TableHeaderAction>
        {headerActions as React.ReactElement<Record<string, unknown>> | null}
      </TableHeaderAction>

      {!isLoading && !data.length && (
        <section className="flex justify-center items-center py-8 text-xs text-muted-foreground">
          <Empty description="Please check back later or adjust your filters." />
        </section>
      )}

      {!isLoading && data.length > 0 && (
        <Table
          ref={tableRef}
          className="w-full overflow-hidden rounded-xl border border-border/80 text-xs bg-background"
        >
          {children}
        </Table>
      )}

      {data.length > 0 && (
        <div className="mt-3 border border-border/80 rounded-xl text-xs bg-background">
          <Paginator />
        </div>
      )}
    </div>
  ); // Render it conditionally with/without animation return

  const memoizedValue = useMemo<TableContextType<unknown>>(
    () => ({
      data: data as unknown[],
      columns: columns as TableColumn<unknown>[],
      filterFields: resolvedFilterFields,
      exportTitle,
      headerActions: headerActions ?? null,
      service: service as ITableProps<unknown>["service"],
      limit,
      page,
      updateLimit,
      totalRecords,
      handlePaginate,
      onFilter,
      cancelFilter,
      filterIsActive,
      actionable,
      tableRef,
      queryKey,
      isDownloadable,
      isRefetching,
      reload,
      search,
      searchKey,
      summary,
      enableSelection,
      selectedRowIds,
      toggleRowSelection,
      isRowSelected,
      selectAllOnPage,
      clearSelection,
      hasSelection,
      selectedRows: selectedRows as unknown[],
      getRowIdForRow: getRowIdForRow as (
        row: unknown,
        index: number,
      ) => string | number,
      renderSelectionActions: renderSelectionActions
        ? (((params) =>
          renderSelectionActions({
            selectedRows: params.selectedRows as T[],
            clearSelection: params.clearSelection,
          })) as TableContextType<unknown>["renderSelectionActions"])
        : undefined,
    }),
    [
      data,
      columns,
      resolvedFilterFields,
      exportTitle,
      headerActions,
      service,
      limit,
      page,
      updateLimit,
      totalRecords,
      handlePaginate,
      onFilter,
      cancelFilter,
      filterIsActive,
      actionable,
      tableRef,
      queryKey,
      isDownloadable,
      isRefetching,
      reload,
      search,
      searchKey,
      summary,
      enableSelection,
      selectedRowIds,
      toggleRowSelection,
      isRowSelected,
      selectAllOnPage,
      clearSelection,
      hasSelection,
      selectedRows,
      getRowIdForRow,
      renderSelectionActions,
    ],
  );
  return (
    <TableContext.Provider value={memoizedValue}>
      <AnimatedBorderWrapper loading={isLoading || isRefetching}>
        {CardContent}
      </AnimatedBorderWrapper>
    </TableContext.Provider>
  );
}

/* =========================================================
   Filter Form
   ========================================================= */

interface TableFilterFormProps {
  onCloseModal?: () => void;
}

function TableFilterForm({ onCloseModal }: TableFilterFormProps) {
  // If your hook is generic: useTypedTableContext<T>(), you can retain <unknown>:
  const {
    onFilter,
    cancelFilter,
    search,
    filterFields,
    columns,
    isRefetching,
  }: TableContextType<unknown> = useTypedTableContext<unknown>();
  const currentSort = useMemo(() => parseSortValue(search?.sort), [search]);
  const syncedValuesSignature = useMemo(
    () =>
      JSON.stringify(
        {
          ...Object.fromEntries(
            filterFields.map((field) => [field.key, search?.[field.key] ?? ""]),
          ),
          sortField: currentSort.sortField,
          sortDirection: currentSort.sortDirection,
        },
      ),
    [currentSort.sortDirection, currentSort.sortField, filterFields, search],
  );
  const syncedValues = useMemo(
    () => JSON.parse(syncedValuesSignature) as IsearchParams,
    [syncedValuesSignature],
  );

  const form = useForm<IsearchParams>({
    mode: "onChange",
    defaultValues: syncedValues,
  });

  const { control, handleSubmit, reset } = form;
  const watchedSortField = useWatch({
    control,
    name: "sortField",
  });
  const filterKeys = useMemo(
    () => filterFields.map((field) => field.key),
    [filterFields],
  );
  const sortableOptions = useMemo(
    () => buildSortableOptions(columns as TableColumn<unknown>[]),
    [columns],
  );
  const selectedSortOption = useMemo(
    () =>
      sortableOptions.find((option) => option.value === String(watchedSortField ?? "")) ??
      null,
    [sortableOptions, watchedSortField],
  );
  const sortDirectionOptions = useMemo(
    () => getSortDirectionOptions(selectedSortOption?.sortType ?? "date"),
    [selectedSortOption],
  );

  useEffect(() => {
    reset(syncedValues);
  }, [reset, syncedValues]);

  const buildSearchSignature = (params: IsearchParams | null | undefined) => {
    const normalized = removeEmptySearchValues(params ?? {});
    return JSON.stringify(
      Object.entries(normalized).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    );
  };

  const handleSubmitFilter = (data: IsearchParams) => {
    const normalizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (key === "sortField" || key === "sortDirection") {
          return [key, value];
        }

        return [key, value === TABLE_FILTER_CLEAR_VALUE ? "" : value];
      }),
    );
    const sortValue = buildSortValue(
      normalizedData.sortField,
      normalizedData.sortDirection,
    );
    const query = removeEmptySearchValues(normalizedData);
    delete query.sortField;
    delete query.sortDirection;
    if (sortValue) {
      query.sort = sortValue;
    }
    const preservedSearch = Object.fromEntries(
      Object.entries(search ?? {}).filter(
        ([key]) => !filterKeys.includes(key) && key !== "sort",
      ),
    );
    const nextSearch = { ...preservedSearch, ...query };

    if (buildSearchSignature(nextSearch) === buildSearchSignature(search)) {
      onCloseModal?.();
      return;
    }

    onFilter(nextSearch);
    onCloseModal?.();
  };

  const handleCancel = () => {
    const preservedSearch = Object.fromEntries(
      Object.entries(search ?? {}).filter(
        ([key]) => !filterKeys.includes(key) && key !== "sort",
      ),
    );

    if (buildSearchSignature(search) === buildSearchSignature(preservedSearch)) {
      onCloseModal?.();
      return;
    }

    cancelFilter();
    onCloseModal?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleSubmitFilter)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AppDialogBody className="min-h-0 flex-1">
          <section className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">Default Sort</h3>
                <p className="text-xs text-muted-foreground">
                  Choose how rows should be ordered when filters are applied.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={control}
                  name="sortField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort by</FormLabel>
                      <Select
                        value={
                          field.value == null || field.value === ""
                            ? undefined
                            : String(field.value)
                        }
                        onValueChange={(value) =>
                          field.onChange(
                            value === TABLE_FILTER_CLEAR_VALUE ? "" : value,
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-full">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)">
                          <SelectItem value={TABLE_FILTER_CLEAR_VALUE}>
                            No default sort
                          </SelectItem>
                          {sortableOptions.map((option) => (
                            <SelectItem
                              key={`sort-field-${option.value}`}
                              value={String(option.value)}
                            >
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="sortDirection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select
                        value={
                          field.value == null || field.value === ""
                            ? TABLE_SORT_DIRECTION_DESC
                            : String(field.value)
                        }
                        onValueChange={field.onChange}
                        disabled={!watchedSortField}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-full">
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)">
                          {sortDirectionOptions.map((option) => (
                            <SelectItem
                              key={`sort-direction-${option.value}`}
                              value={String(option.value)}
                            >
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filterFields.map((fieldDefinition) => {
              const formKey = fieldDefinition.key;
              const renderField = fieldDefinition.renderField;

              /** ========== TEXT ========== */
              if (renderField) {
                return (
                  <FormField
                    key={formKey}
                    control={control}
                    name={formKey}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <FormControl>
                          {renderField({
                            value: field.value,
                            onChange: field.onChange as TableFilterFieldRenderProps["onChange"],
                            disabled: isRefetching,
                          })}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              /** ========== TEXT ========== */
              if (fieldDefinition.searchType === "TEXT") {
                return (
                  <FormField
                    key={formKey}
                    control={control}
                    name={formKey}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={
                              fieldDefinition.placeholder ??
                              `Enter ${fieldDefinition.label}`
                            }
                            value={field.value == null ? "" : String(field.value)}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              /** ========== NUMBER ========== */
              if (fieldDefinition.searchType === "NUMBER") {
                return (
                  <FormField
                    key={formKey}
                    control={control}
                    name={formKey}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value == null ? "" : String(field.value)}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === "" ? "" : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              /** ========== DROPDOWN ========== */
              if (fieldDefinition.searchType === "DROPDOWN") {
                return (
                  <FormField
                    key={formKey}
                    control={control}
                    name={formKey}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <Select
                          value={
                            field.value == null || field.value === ""
                              ? undefined
                              : String(field.value)
                          }
                          onValueChange={(value) =>
                            field.onChange(
                              value === TABLE_FILTER_CLEAR_VALUE ? "" : value,
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-full">
                              <SelectValue
                                placeholder={`Select ${fieldDefinition.label.toLowerCase()}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)">
                            <SelectItem value={TABLE_FILTER_CLEAR_VALUE}>
                              Clear selection
                            </SelectItem>
                            {fieldDefinition.selectOptions?.map(
                              (opt: IselectOptions, idx: number) => (
                                <SelectItem key={idx} value={String(opt.value)}>
                                  {opt.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              /** ========== RADIO ========== */
              if (fieldDefinition.searchType === "RADIO") {
                return (
                  <FormField
                    key={formKey}
                    control={control}
                    name={formKey}
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={
                              field.value == null || field.value === ""
                                ? undefined
                                : String(field.value)
                            }
                            onValueChange={(value) =>
                              field.onChange(
                                value === TABLE_FILTER_CLEAR_VALUE ? "" : value,
                              )
                            }
                            className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
                          >
                            {fieldDefinition.selectOptions?.map((option) => {
                              const isSelected =
                                String(field.value ?? "") ===
                                String(option.value);

                              return (
                                <div
                                  key={`${formKey}-${option.value}`}
                                  onClick={() =>
                                    field.onChange(
                                      isSelected ? "" : String(option.value),
                                    )
                                  }
                                  className={cn(
                                    "flex cursor-pointer items-start gap-2.5 rounded-lg border-2 p-3 transition-all",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-muted-foreground/30",
                                  )}
                                  role="presentation"
                                >
                                  <RadioGroupItem
                                    value={String(option.value)}
                                    className="pointer-events-none mt-0.5"
                                  />
                                  <div className="flex-1 space-y-1 text-left">
                                    <div className="text-sm font-medium text-foreground">
                                      {option.name}
                                    </div>
                                    {option.description ? (
                                      <p className="text-[11px] leading-5 text-muted-foreground">
                                        {option.description}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">
                          Leave unselected to avoid applying this filter.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              return null;
            })}
            </div>
          </section>
        </AppDialogBody>

        <AppDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Clear filters
          </Button>

          <Button
            type="submit"
            disabled={isRefetching}
          >
            {isRefetching ? "Applying..." : "Apply filters"}
          </Button>
        </AppDialogFooter>
      </form>
    </Form>
  );
}

/* =========================================================
   Filter Trigger Wrapper
   ========================================================= */

export function TableFilter() {
  const { filterIsActive }: TableContextType<unknown> =
    useTypedTableContext<unknown>();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className={`flex shrink-0 items-center justify-center gap-1 rounded-lg border px-4 py-2 text-xs font-light whitespace-nowrap transition-colors ${filterIsActive
            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
            : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/40 hover:text-foreground"
            }`}
        >
          {filterIsActive ? (
            <FunnelX color="green" size={12} className="mr-1" />
          ) : (
            <Funnel color="green" size={12} className="mr-1" />
          )}
          Filter
        </Button>
      </DialogTrigger>

      <AppDialogContent className="flex h-[min(100dvh-1rem,52rem)] flex-col sm:h-auto sm:max-h-[min(100dvh-2rem,52rem)] sm:max-w-3xl">
        <AppDialogHeader
          title="Manage filters"
          description="Refine the current table results with the available filter options."
          icon={Funnel}
        />

        <TableFilterForm onCloseModal={handleClose} />
      </AppDialogContent>
    </Dialog>
  );
}

function TableHeaders() {
  const {
    columns,
    actionable,
    enableSelection,
    data,
    selectAllOnPage,
    clearSelection,
    selectedRowIds,
  } = useTypedTableContext<unknown>();

  const allOnPageSelected =
    enableSelection && data.length > 0 && selectedRowIds.size === data.length;

  return (
    <TableHeader className="bg-muted/80 backdrop-blur-sm capitalize sticky top-0 z-10">
      <TableRow>
        {enableSelection && (
          <TableHead className="w-8 px-2 py-3">
            <Checkbox
              id="checkbox-all-rows"
              aria-label="Select all rows on page"
              checked={allOnPageSelected}
              onCheckedChange={() =>
                allOnPageSelected ? clearSelection() : selectAllOnPage()
              }
              className="m-0"
            />
          </TableHead>
        )}

        <TableHead className="font-medium px-2 whitespace-nowrap">
          <span>S/N</span>
        </TableHead>

        {columns.map((col: TableColumn) => (
          <TableHead
            colSpan={col.colspan}
            key={col.key ?? String(col.accessor) ?? col.header}
            className="px-2 grow"
          >
            {col.header}
          </TableHead>
        ))}
        {actionable && (
          <TableHead className="px-2 whitespace-nowrap">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
export function TableHeaderAction({
  children,
}: {
  children?: React.ReactElement<Record<string, unknown>> | null;
}) {
  const {
    onFilter,
    tableRef,
    queryKey,
    isDownloadable,
    filterFields,
    searchKey,
    search,
    summary,
    reload,
    isRefetching,
    data,
    columns,
    exportTitle,
    service,
    totalRecords,
    limit,
    actionable,
    enableSelection,
    hasSelection,
    selectedRows,
    clearSelection,
    renderSelectionActions,
  } = useTypedTableContext<unknown>();
  const { mutateAsync: exportTablePdf, isPending: isExporting } =
    useTableExport();
  const [exportScopeInFlight, setExportScopeInFlight] =
    useState<TableExportScope | null>(null);
  const [visualizeOpen, setVisualizeOpen] = useState(false);

  // const [searchValue, setSearchValue] = useState("");

  function debounce(fn: (value: string) => void, delay = 500) {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (value: string) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(value), delay);
    };
  }

  const debouncedFilter = useMemo(
    () =>
      debounce((value: string) => {
        onFilter({
          ...search,
          ...(searchKey ? { [searchKey]: value ?? undefined } : {}),
        });
      }, 500),
    [onFilter, search, searchKey],
  );

  const resolvedExportTitle = exportTitle ?? humanizeQueryKey(queryKey);
  const exportHeaders = useMemo(
    () => columns.map((column) => column.header),
    [columns],
  );

  const buildCurrentPageRows = React.useCallback(() => {
    const table = tableRef.current;
    if (!table) {
      throw new Error("The table is not ready for export yet.");
    }

    const bodyRows = Array.from(table.querySelectorAll("tbody tr"));
    const startIndex = enableSelection ? 2 : 1;

    return bodyRows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        const endIndex = actionable ? cells.length - 1 : cells.length;
        return cells
          .slice(startIndex, endIndex)
          .slice(0, exportHeaders.length)
          .map((cell) =>
            formatExportCellValue((cell as HTMLElement).innerText),
          );
      })
      .filter((row) => row.length > 0);
  }, [actionable, enableSelection, exportHeaders.length, tableRef]);

  const buildAllFilteredRows = React.useCallback(async () => {
    const exportLimit = Math.min(
      Math.max(totalRecords, data.length, limit, 1),
      TABLE_EXPORT_MAX_ROWS,
    );
    const response = await service({
      page: 1,
      limit: exportLimit,
      search,
    });

    return response.data.map((row) =>
      columns.map((column) => {
        const rawValue = column.exportValue
          ? column.exportValue(row)
          : getValueByAccessor(row, column.accessor);
        return formatExportCellValue(rawValue);
      }),
    );
  }, [columns, data.length, limit, search, service, totalRecords]);

  const handleExport = React.useCallback(
    async (scope: TableExportScope) => {
      let progressToast: ReturnType<typeof createProgressToast> | null = null;

      try {
        setExportScopeInFlight(scope);
        const rows =
          scope === TABLE_EXPORT_SCOPE.ALL_FILTERED
            ? await buildAllFilteredRows()
            : buildCurrentPageRows();

        if (!rows.length) {
          toast.error("There are no rows available to export.");
          return;
        }

        if (
          scope === TABLE_EXPORT_SCOPE.ALL_FILTERED &&
          totalRecords > TABLE_EXPORT_MAX_ROWS
        ) {
          toast.info(
            `Only the first ${TABLE_EXPORT_MAX_ROWS.toLocaleString()} filtered rows were exported.`,
          );
        }

        const scopeLabel =
          scope === TABLE_EXPORT_SCOPE.ALL_FILTERED
            ? "all filtered"
            : "current page";
        progressToast = createProgressToast(
          `Generating ${scopeLabel} table export...`,
        );

        const blob = await exportTablePdf({
          payload: {
            title: resolvedExportTitle,
            scope,
            headers: exportHeaders,
            rows,
            summary,
            exportedAt: new Date().toISOString(),
          },
          onProgress: progressToast.updateProgress,
        });

        const filenameScopeLabel =
          scope === TABLE_EXPORT_SCOPE.ALL_FILTERED
            ? "all-filtered"
            : "current-page";
        downloadBlob(
          blob,
          `${slugifyFileName(resolvedExportTitle)}-${filenameScopeLabel}.pdf`,
        );
        progressToast.success("Table export downloaded.");
      } catch (error) {
        if (error instanceof Error) {
          progressToast?.error(error.message);
          if (!progressToast) {
            toast.error(error.message);
          }
        } else {
          progressToast?.error("Unable to export the current table.");
          if (!progressToast) {
            toast.error("Unable to export the current table.");
          }
        }
      } finally {
        setExportScopeInFlight(null);
      }
    },
    [
      buildAllFilteredRows,
      buildCurrentPageRows,
      exportHeaders,
      exportTablePdf,
      resolvedExportTitle,
      summary,
      totalRecords,
    ],
  );

  let primaryActions: React.ReactNode = null;

  if (children) {
    primaryActions = cloneElement(children, {
      onFilter,
      summary,
    } as Record<string, unknown>);
  }

  let selectionActions: React.ReactNode = null;

  if (hasSelection && renderSelectionActions) {
    const renderedSelectionActions = renderSelectionActions({
      selectedRows,
      clearSelection,
    });

    if (renderedSelectionActions) {
      selectionActions = (
        <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="plain" className="px-2.5 py-1 text-[11px] font-medium">
              {selectedRows.length} selected
            </Badge>

            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
            {renderedSelectionActions}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="mb-1 flex flex-col gap-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="w-full text-xs xl:max-w-md">
          <Search
            placeHolder={`Search by ${searchKey}`}
            onSearch={debouncedFilter}
          />
        </div>

        <div className="flex w-full flex-col gap-2 xl:w-auto xl:flex-row xl:flex-nowrap xl:items-start xl:justify-end">
          {primaryActions ? <div className="w-full xl:w-auto">{primaryActions}</div> : null}

          <div className="ml-auto flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto pb-1 xl:w-auto xl:overflow-visible xl:pb-0">
            {filterFields.length > 0 ? <TableFilter /> : null}
            <Button
              type="button"
              variant={"ghost"}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-light whitespace-nowrap"
              onClick={() => setVisualizeOpen(true)}
              disabled={!data.length}
            >
              <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-primary/30 text-[10px] font-semibold text-primary">
                V
              </span>
              Visualize
            </Button>
            <Button
              type="button"
              variant={"ghost"}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-light whitespace-nowrap"
              onClick={() => void reload()}
              disabled={isRefetching}
            >
              <RotateCw className={`size-3.5 text-primary ${isRefetching ? "animate-spin" : ""}`} />
              {isRefetching ? "Reloading..." : "Reload"}
            </Button>
            {isDownloadable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant={"ghost"}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-light whitespace-nowrap"
                    disabled={!data.length || isExporting}
                  >
                    <Download
                      className={`size-3.5 text-primary ${isExporting ? "animate-pulse" : ""}`}
                    />
                    {isExporting ? "Generating..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => void handleExport(TABLE_EXPORT_SCOPE.CURRENT_PAGE)}
                  >
                    {exportScopeInFlight === TABLE_EXPORT_SCOPE.CURRENT_PAGE
                      ? "Generating current page PDF..."
                      : "Current page PDF"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => void handleExport(TABLE_EXPORT_SCOPE.ALL_FILTERED)}
                  >
                    {exportScopeInFlight === TABLE_EXPORT_SCOPE.ALL_FILTERED
                      ? "Generating all filtered PDF..."
                      : "All filtered PDF"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {selectionActions}

      <TableVisualizeSheet
        open={visualizeOpen}
        onOpenChange={setVisualizeOpen}
        title={`Visualize ${resolvedExportTitle}`}
        rows={data}
        columns={columns}
        totalRecords={totalRecords}
      />
    </div>
  );
}
interface TableRowsProps {
  children: React.ReactElement<Record<string, unknown>>;
  customRow?: boolean;
}

function TableRows({ children }: TableRowsProps) {
  const {
    // columns,
    data,
    // actionable,
    enableSelection,
    toggleRowSelection,
    isRowSelected,
    getRowIdForRow,
  } = useTypedTableContext<unknown>();

  // if (data?.length < 1) {
  // 	return (
  // 		<tbody className=' w-full h-5'>
  // 			<tr>
  // 				<td className='  block p-2 text-sm '>No data available</td>
  // 			</tr>
  // 		</tbody>
  // 	);
  // }

  return (
    <TableBody className="bg-card [&_tr:nth-child(even)]:bg-muted/30">
      {/* {!customRow
        ? data?.map((row, i: number) => {
          const rowId = getRowIdForRow(row as unknown, i);
          const checked = enableSelection && isRowSelected(rowId);
          return (
            <TableRow
              key={String(rowId)}
              className="px-2 relative border-b hover:bg-muted/40 transition-colors"
            >
              {enableSelection && (
                <TableCell className="w-8 px-2">
                  <input
                    title="Select row"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRowSelection(rowId)}
                    className="w-4 h-4 m-0 border-border rounded focus:ring-ring"
                  />
                </TableCell>
              )}
              <TableCell className=" font-medium">
                <span>{i + 1}.</span>
              </TableCell>

              {columns.map((column: TableColumn, i: number) => {
                //This logic helps check for more accessors; double items in a row cell
                const value = String(column.accessor)
                  ?.split(".")
                  .reduce((obj: unknown, key) => {
                    if (obj && typeof obj === "object") {
                      const record = obj as Record<string, unknown>;
                      return record[key] as unknown;
                    }
                    return undefined;
                  }, row as unknown);

                if (column.custom) {
                  if (column.custom.type === "style") {
                    return (
                      <TableCell
                        className={`${column.custom.bolden ? "font-semibold" : ""
                          }`}
                        key={`${String(column.accessor)}-${i}`}
                      >
                        <span
                          title={
                            value !== undefined && value !== null
                              ? String(value)
                              : undefined
                          }
                          className="bg-status-resolved text-xs capitalize w-1/2 lg:w-1/4 justify-center text-white py-2 px-3 rounded-3xl inline-flex"
                        >
                          {value !== undefined && value !== null
                            ? String(value)
                            : "--"}
                        </span>
                      </TableCell>
                    );
                  }
                  if (column.custom.type === "date") {
                    const dateValue = value as
                      | string
                      | number
                      | Date
                      | undefined;
                    const dateText = dateValue
                      ? new Date(dateValue).toDateString()
                      : "--";
                    return (
                      <TableCell
                        className={`${column.custom.bolden ? "font-semibold" : ""
                          } ellipisis-overflow block`}
                        title={dateText !== "--" ? dateText : undefined}
                        key={`${String(column.accessor)}-${i}`}
                      >
                        {dateText}
                      </TableCell>
                    );
                  }
                  if (column.custom.type === "currency") {
                    const numValue = value as number | string | undefined;
                    return (
                      <TableCell
                        className={`${column.custom.bolden ? "font-semibold" : ""
                          }`}
                        key={`${String(column.accessor)}-${i}`}
                      >
                        <span
                          title={
                            numValue !== undefined
                              ? formatCurrency(numValue)
                              : undefined
                          }
                          className="ellipsis-overflow block"
                        >
                          {numValue !== undefined
                            ? formatCurrency(numValue)
                            : "--"}
                        </span>
                      </TableCell>
                    );
                  }
                  if (column.custom.type === "percent") {
                    const numValue = value as number | string | undefined;
                    return (
                      <TableCell
                        className={`${column.custom.bolden ? "font-semibold" : ""
                          }`}
                        title={
                          value !== undefined && value !== null
                            ? String(value)
                            : undefined
                        }
                        key={`${String(column.accessor)}-${i}`}
                      >
                        {numValue ?? "--"} %
                      </TableCell>
                    );
                  }
                  if (column.custom.type === "sentence") {
                    const text = String(value ?? "");
                    return (
                      <TableCell
                        className={`${column.custom.bolden ? "font-semibold" : ""
                          }`}
                        key={`${String(column.accessor)}-${i}`}
                      >
                        {text} {""} {column.custom.suffix}
                      </TableCell>
                    );
                  }
                }
                return (
                  <TableCell key={`${String(column.accessor)}-${i}`}>
                    <span
                      title={value as string | undefined}
                      className="block ellipsis-overflow"
                    >
                      {value !== undefined && value !== null
                        ? (value as React.ReactNode)
                        : "--"}
                    </span>
                  </TableCell>
                );
              })}

              {actionable &&
                cloneElement(children, {
                  rowData: row,
                } as Record<string, unknown>)}
            </TableRow>
          );
        }) */}
      {cloneElement(children, {
        data,
        enableSelection,
        getRowIdForRow,
        isRowSelected,
        toggleRowSelection,
      } as Record<string, unknown>)}
    </TableBody>
  );
}

function Paginator() {
  const { updateLimit, data, limit, page, totalRecords, handlePaginate } =
    useTypedTableContext<unknown>();

  const maxNumPage = useMemo(() => {
    return Math.ceil(totalRecords / limit);
  }, [totalRecords, limit]);

  const numPages = Math.ceil(totalRecords / limit);
  const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <section className="flex justify-between p-4 items-center w-full">
      <div className="flex flex-col gap-1">
        <strong>Summary</strong>
        <p>
          Showing <span>1</span> to <span>{data?.length}</span> of{" "}
          <span>{totalRecords}</span> results
        </p>
        <div className="text-sm text-muted-foreground">
          Total: {totalRecords} | Size: {limit} | Page: {page}
        </div>
      </div>

      {data?.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <label htmlFor="limit" className="text-sm">
              Rows per page
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => updateLimit(Number(e.target.value))}
              className="text-xs bg-background border rounded px-2 py-1"
            >
              {[5, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && handlePaginate(page - 1, limit)}
                  className={
                    page === 1
                      ? " cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {pageNumbers.slice(Math.max(0, page - 2), page + 1).map((num) => (
                <PaginationItem key={num}>
                  <PaginationLink
                    className="cursor-pointer"
                    isActive={page === num}
                    onClick={() => handlePaginate(num, limit)}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {numPages > page + 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    page < maxNumPage && handlePaginate(page + 1, limit)
                  }
                  className={
                    page >= maxNumPage
                      ? " cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}

TableComponent.TableHeader = TableHeaders;
TableComponent.TableRow = TableRows;

export default TableComponent;
