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
  TableContextType,
} from "./models/table.model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatCurrency } from "@/utils/helper";
import { useTable } from "./hooks/useTable";
import { useForm } from "react-hook-form";
import { DownloadTableExcel } from "react-export-table-to-excel";
import TextInput from "../form-elements/Text-Input";
import Modal from "../modal/Modal";
import ButtonComponent from "../form-elements/Button";
import Search from "../search/Search";
import Empty from "../empty/Empty";
import AnimatedBorderWrapper from "../animation/AnimatedBorder";
import {
  Table,
  TableBody,
  TableCell,
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
import { FolderInput, Funnel, FunnelX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const TableContext = createContext<TableContextType<unknown> | undefined>(
  undefined
);

function useTypedTableContext<T>() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error("Table components must be used within TableComponent");
  }
  return ctx as TableContextType<T>;
}

function TableComponent<T>({
  queryKey,
  children,
  columns,
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
    defaultParams ?? null
  );
  const [filterIsActive, setfilterIsActive] =
    useState<boolean>(!!defaultParams);

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );

  const {
    isLoading,
    error,
    data = [],
    summary,
    totalRecords,
    results,
    isRefetching,
  }: IListResponse<T> = useTable<T>(page, limit, service, queryKey, search);

  //reload my table
  // function reloadTable() {
  // 	setPage(1);
  // 	// Remove all filters
  // 	setSearch(null);
  // 	setfilterIsActive(false);
  // }

  // function onFilter(val: IsearchParams | null) {
  //   let transformedSearchQuery = "";
  //   if (!val) {
  //     setfilterIsActive(false);
  //     setSearch(null);
  //     return;
  //   }

  //   // transformedSearchQuery = buildQueryString(val);

  //   // transformedSearchQuery = objectToQueryParams(val);

  //   setSearch((search) => ({ ...search, ...val }));
  //   setPage(1);

  //   setfilterIsActive(true);
  // }

  // const queryClient = useQueryClient();

  // function updatePage(val: number) {
  //   setPage(val);
  // }

  // --- actions (memoize) ---
  const updateLimit = React.useCallback((n: number) => setLimit(n), []);
  const handlePaginate = React.useCallback((page: number, limit: number) => {
    setPage(page);
    setLimit(limit);
  }, []);
  const onFilter = React.useCallback((val: IsearchParams | null) => {
    // let transformedSearchQuery = "";
    if (!val) {
      setfilterIsActive(false);
      setSearch(null);
      return;
    }

    setSearch((search) => ({ ...search, ...val }));
    setPage(1);

    setfilterIsActive(true);
  }, []);

  const cancelFilter = React.useCallback(() => {
    setfilterIsActive(false);
    setSearch(null);
  }, []);

  const tableRef = useRef(null);

  const getRowIdForRow = React.useCallback(
    (row: T, index: number) => {
      if (getRowId) return getRowId(row, index);
      return index;
    },
    [getRowId]
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
    [selectedRowIds]
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
    <div className="bg-card/80 backdrop-blur-sm p-3 border border-border/80 rounded-xl space-y-3">
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
        index: number
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
    ]
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
    columns,
    isRefetching,
  }: TableContextType<unknown> = useTypedTableContext<unknown>();

  const { register, handleSubmit, formState, setValue, watch } =
    useForm<IsearchParams>({
      mode: "onChange",
      defaultValues: { ...(search ?? {}) },
    });

  function removeEmptyObjValues(data: IsearchParams) {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) =>
          v !== "" && v != null && !(typeof v === "number" && Number.isNaN(v))
      )
    );
  }

  const handleSubmitFilter = (data: IsearchParams) => {
    const query = removeEmptyObjValues(data);

    onFilter({ ...(search ?? {}), ...query });
    onCloseModal?.();
  };

  const handleCancel = () => {
    cancelFilter();
    onCloseModal?.();
  };

  const getKeyForColumn = (column: TableColumn<unknown>): string =>
    column.filterKey ?? column.header;

  return (
    <form
      onSubmit={handleSubmit(handleSubmitFilter)}
      className="flex flex-col gap-4"
    >
      <section className="grid grid-cols-1 gap-3">
        {columns
          .slice()
          .filter((col) => col.searchType)
          .map((column: TableColumn<unknown>) => {
            const formKey = getKeyForColumn(column);

            /** ========== TEXT ========== */
            if (column.searchType === "TEXT") {
              return (
                <div
                  key={String(column.accessor)}
                  className="flex flex-col gap-1"
                >
                  <Label htmlFor={String(column.header)}>{column.header}</Label>
                  <Input
                    id={String(column.header)}
                    type="text"
                    placeholder={`Enter ${column.header}`}
                    {...register(formKey)}
                  />
                </div>
              );
            }

            /** ========== NUMBER ========== */
            if (column.searchType === "NUMBER") {
              return (
                <div
                  key={String(column.accessor)}
                  className="flex flex-col gap-1"
                >
                  <Label htmlFor={String(column.header)}>{column.header}</Label>
                  <Input
                    id={String(column.header)}
                    type="number"
                    {...register(formKey, { valueAsNumber: true })}
                  />
                </div>
              );
            }

            /** ========== DROPDOWN ========== */
            if (column.searchType === "DROPDOWN") {
              const currentValue = watch(formKey) ?? "";

              return (
                <div
                  key={String(column.accessor)}
                  className="flex flex-col gap-1"
                >
                  <Label>{column.header}</Label>
                  <Select
                    value={
                      currentValue === undefined ? "" : String(currentValue)
                    }
                    onValueChange={(val) => {
                      setValue(formKey, val || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${column.header.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {column.selectOptions?.map(
                        (opt: IselectOptions, idx: number) => (
                          <SelectItem key={idx} value={String(opt.value)}>
                            {opt.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return null;
          })}
      </section>

      <hr className="my-3" />

      <section className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-3xl"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="rounded-3xl"
          disabled={!formState.isValid || isRefetching}
        >
          {isRefetching ? "Searching..." : "Search"}
        </Button>
      </section>
    </form>
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
          variant="secondary"
          className={`flex items-center gap-1 text-xs px-4 py-2 rounded-lg font-light ${
            filterIsActive
              ? "ring-1 ring-offset-2 text-green-600 ring-green-600"
              : ""
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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage filters</DialogTitle>
          <DialogDescription>
            Quickly find table records using the available filters.
          </DialogDescription>
        </DialogHeader>

        <TableFilterForm onCloseModal={handleClose} />
      </DialogContent>
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
    <TableHeader className="bg-muted/80 backdrop-blur capitalize sticky top-0 z-10">
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
    searchKey,
    search,
    summary,
    hasSelection,
    selectedRows,
    clearSelection,
    renderSelectionActions,
  } = useTypedTableContext<unknown>();

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
    [onFilter, search, searchKey]
  );

  let primaryActions: React.ReactNode = null;
  if (hasSelection && renderSelectionActions) {
    primaryActions = renderSelectionActions({
      selectedRows,
      clearSelection,
    });
  } else if (children) {
    primaryActions = cloneElement(children, {
      onFilter,
      summary,
    } as Record<string, unknown>);
  }

  return (
    <div className="flex flex-col gap-2 justify-between mb-1">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex-1 min-w-[220px] max-w-md text-xs">
          <Search
            placeHolder={`Search by ${searchKey}`}
            onSearch={debouncedFilter}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          {primaryActions}
          <TableFilter />
          {isDownloadable && (
            <DownloadTableExcel
              filename={`${queryKey} table`}
              sheet={queryKey}
              currentTableRef={tableRef}
            >
              <Button
                variant={"secondary"}
                className=" text-xs px-4 py-2 gap-1 rounded-lg flex items-center font-light"
              >
                <FolderInput color="orange" size={12} />
                Export
              </Button>
            </DownloadTableExcel>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
        {hasSelection && (
          /* ------------------ SELECTION STATE ------------------ */
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
              {selectedRows.length} selected
            </Badge>

            <button
              type="button"
              onClick={clearSelection}
              className="underline-offset-2 hover:underline text-[11px]"
            >
              Clear
            </button>
          </div>
        )}
        {!hasSelection && summary && Boolean(Object.keys(summary).length) && (
          /* ----------------------- SUMMARY ----------------------- */
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px]">Summary:</span>
            {Object.entries(summary).map(([key, value], idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-[10px] font-normal px-2 py-0.5"
              >
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
interface TableRowsProps {
  children: React.ReactElement<Record<string, unknown>>;
  customRow?: boolean;
}

function TableRows({ children, customRow }: TableRowsProps) {
  const {
    columns,
    data,
    actionable,
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
    <TableBody className="">
      {!customRow
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
                      className="w-4 h-4 m-0 border-gray-300 rounded focus:ring-ring"
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
                          className={`${
                            column.custom.bolden ? "font-semibold" : ""
                          }`}
                          key={`${String(column.accessor)}-${i}`}
                        >
                          <span
                            title={
                              value !== undefined && value !== null
                                ? String(value)
                                : undefined
                            }
                            className="bg-green-400 text-xs capitalize w-1/2 lg:w-1/4 justify-center text-white py-2 px-3 rounded-3xl inline-flex"
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
                          className={`${
                            column.custom.bolden ? "font-semibold" : ""
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
                          className={`${
                            column.custom.bolden ? "font-semibold" : ""
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
                          className={`${
                            column.custom.bolden ? "font-semibold" : ""
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
                          className={`${
                            column.custom.bolden ? "font-semibold" : ""
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
          })
        : cloneElement(children, {
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
