export interface ITable {
	queryKey: string;
	children: React.ReactNode;
	columns: TableColumn[];
	headerActions?: React.ReactNode;
	limit?: number;
	service: any;
	actionable?: boolean;
	isDownloadable?: boolean;
	defaultParams?: IsearchParams;
	searchKey?: string;
}

export interface IsearchParams {
	[key: string]: any;
}

interface TableConfig {
	actionable?: boolean;
	checkable?: boolean;
}

export interface TableColumn {
	header: string;
	accessor: string;
	key?: string;
	custom?: {
		type: string;
		suffix?: string;
		prefix?: string;
		bolden?: boolean;
	};
	searchType?: 'TEXT' | 'DROPDOWN' | 'NUMBER';
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
}
