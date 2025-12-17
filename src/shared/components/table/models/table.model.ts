export interface ITableProps<T> {
  queryKey: string;
  children: React.ReactNode;
  columns: TableColumn<T>[];
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

export interface IsearchParams {
  [key: string]: any;
}

interface TableConfig {
  actionable?: boolean;
  checkable?: boolean;
}

export interface TableColumn<T = any> {
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
  searchType?: "TEXT" | "DROPDOWN" | "NUMBER";
  selectOptions?: IselectOptions[];
  filterKey?: string;
  colspan?: number;
}

export interface IselectOptions {
  name: string;
  value: string | number;
}
export interface IListResponse<T> {
  isLoading: boolean;
  error: Error | null;
  data: T[] | undefined;
  totalRecords: number;
  results: number;
  isRefetching: boolean;
  summary: Record<string, number>;
}

export interface TableContextType<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
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
