export interface ITable {
	queryKey: string;
	children: React.ReactNode;
	columns: Icolumn[];
	headerActions?: React.ReactNode;
	limit?: number;
	service: any;
	actionable?: boolean;
	isDownloadable?: boolean;
	defaultParams?: IsearchParams;
}

export interface IsearchParams {
	[key: string]: any;
}

interface TableConfig {
	actionable?: boolean;
	checkable?: boolean;
}

export interface Icolumn {
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
}

export interface IselectOptions {
	name: string;
	value: string | number;
}
export interface IListResponse {
	isLoading: boolean;
	error: any;
	data: any[];
	totalRecords: number;
	results: number;
	isRefetching: boolean;
}
