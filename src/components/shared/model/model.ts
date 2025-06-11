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
}

export interface FileUploadPreview {
	id: number;
	url: string;
	type: string;
	file: File;
	uploadProgress: number;
}
