export interface IRequest {
	title: string;
	description: string;
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	_id: string;
	createdAt: string;
	images?: string[];
	videos?: string[];
	user: { name: string };
	area: string;
	category: { name: string };
	id: string;
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
