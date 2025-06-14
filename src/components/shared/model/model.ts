export interface Category {
	id: string;
	name: string;
	description?: string;
	createdAt?: Date;
	_id: string;
}

export interface MaintenanceRequest {
	title: string;
	description: string;
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	_id: string;
	createdAt: string;
	images?: string[];
	videos?: string[];
	user: User;
	area: string;
	category: Category;
	id: string;
}

// export type MaintenanceRequestPayload = Omit<
// 	MaintenanceRequest,
// 	'_id' | 'createdAt' | 'id' | 'category' | 'user'
// > & {
// 	status?: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
// };
export interface MaintenanceRequestPayload
	extends Omit<
		MaintenanceRequest,
		'_id' | 'createdAt' | 'id' | 'category' | 'user' | 'status'
	> {
	status?: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	category: string;
}

export interface FileUploadPreview {
	id: number;
	url: string;
	type: string;
	file: File;
	uploadProgress: number;
}

export interface ApiError {
	message: string;
}

export interface ApiResponse<T> {
	status: string;
	message: string;
	data: T;
}

export interface ITab {
	title: string;
	order: number;
	icon: React.ReactNode;
}

export interface User {
	id: string;
	name: string;
}
