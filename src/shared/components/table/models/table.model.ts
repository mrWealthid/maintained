export interface ITableProps<T> {
  queryKey: string;
  children: React.ReactNode;
  columns: TableColumn<T>[];
  filterFields?: TableFilterField[];
  exportTitle?: string;
  headerActions?: React.ReactElement | null;
  /**
   * Initial page size. Defaults to 5.
   */
  limit?: number;
  /**
   * Data fetching service. It should accept `{ page, limit, search }`
   * and return an object that matches `IListResponse<T>`.
   */
  service: (params: {
    page: number;
    limit: number;
    search?: IsearchParams | null;
  }) =>
    | Promise<{
        data: T[];
        totalRecords: number;
        results: number;
        summary: Record<string, number>;
      }>
    | {
        data: T[];
        totalRecords: number;
        results: number;
        summary: Record<string, number>;
      };
  actionable?: boolean;
  isDownloadable?: boolean;
  defaultParams?: IsearchParams;
  searchKey?: string;
  /**
   * Enable checkbox selection for rows.
   */
  enableSelection?: boolean;
  /**
   * Derive a stable row id for selection. Defaults to row index.
   */
  getRowId?: (row: T, index: number) => string | number;
  /**
   * Called whenever the set of selected rows changes.
   */
  onSelectionChange?: (rows: T[]) => void;
  /**
   * Render custom bulk actions (e.g. "Delete selected") when rows are selected.
   */
  renderSelectionActions?: (params: {
    selectedRows: T[];
    clearSelection: () => void;
  }) => React.ReactNode;
}

export type IsearchParams = Record<string, unknown>;

export type TableSearchType = "TEXT" | "DROPDOWN" | "NUMBER" | "RADIO";
export type TableSortType = "string" | "number" | "date";

export interface TableColumn<T = Record<string, unknown>> {
  header: string;
  /**
   * Supports nested accessors via dot notation, e.g. "user.name".
   */
  accessor: keyof T | string;
  key?: string;
  custom?: {
    type: string;
    suffix?: string;
    prefix?: string;
    bolden?: boolean;
  };
  searchType?: TableSearchType;
  selectOptions?: IselectOptions[];
  filterKey?: string;
  sortType?: TableSortType;
  colspan?: number;
  exportValue?: (row: T) => unknown;
}

export interface IselectOptions {
  name: string;
  value: string | number;
  description?: string;
}

export interface TableFilterField {
  key: string;
  label: string;
  searchType: TableSearchType;
  placeholder?: string;
  selectOptions?: IselectOptions[];
  renderField?: (props: TableFilterFieldRenderProps) => React.ReactNode;
}

export interface TableFilterFieldRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}
export interface IListResponse<T> {
  isLoading: boolean;
  error: Error | null;
  data: T[] | undefined;
  totalRecords: number;
  results: number;
  isRefetching: boolean;
  summary: Record<string, number>;
  reload: () => Promise<unknown>;
}

export interface TableContextType<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  filterFields: TableFilterField[];
  exportTitle?: string;
  headerActions?: React.ReactElement | null;
  service: ITableProps<T>["service"];
  limit: number;
  page: number;
  updateLimit: (n: number) => void;
  totalRecords: number;
  handlePaginate: (page: number, limit: number) => void;
  onFilter: (val: IsearchParams | null) => void;
  cancelFilter: () => void;
  filterIsActive: boolean;
  actionable: boolean;
  tableRef: React.RefObject<HTMLTableElement | null>;
  queryKey: string;
  isDownloadable: boolean;
  isRefetching: boolean;
  reload: () => Promise<unknown>;
  search: IsearchParams | null;
  searchKey?: string;
  summary: Record<string, number>;
  /** Row selection state & helpers */
  enableSelection: boolean;
  selectedRowIds: Set<string | number>;
  toggleRowSelection: (id: string | number) => void;
  isRowSelected: (id: string | number) => boolean;
  selectAllOnPage: () => void;
  clearSelection: () => void;
  hasSelection: boolean;
  selectedRows: T[];
  getRowIdForRow: (row: T, index: number) => string | number;
  /** Custom bulk action renderer, if provided on the table */
  renderSelectionActions?: (params: {
    selectedRows: unknown[];
    clearSelection: () => void;
  }) => React.ReactNode;
}
