import { INVITE_STATUS, ROLES, TICKET_STATUS } from '@/app/shared/enums/enums';

export interface Category {
	id: string;
	name: string;
	description?: string;
	createdAt?: Date;
	_id: string;
}

export interface Ticket {
	title: string;
	description: string;
	status: TICKET_STATUS;
	_id: string;
	createdAt: string;
	images?: string[];
	videos?: string[];
	user: Pick<User, 'id' | 'name'>;
	area: string;
	category: Category;
	id: string;
}

export interface CreateTicketPayload
	extends Omit<
		Ticket,
		'_id' | 'createdAt' | 'id' | 'category' | 'user' | 'status'
	> {
	status?: TICKET_STATUS;
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
export interface ApiPaginatedResponse<T> {
	status: string;
	message: string;
	data: T;
	totalRecords: number;
	results: number;
}

export interface ITab {
	title: string;
	order: number;
	icon: React.ReactNode;
}

export interface ButtonGroupTabsProps<T = string> {
	handleClick: (type: TICKET_STATUS) => void;
	status: TICKET_STATUS;
	data: TabData<T>[];
}

interface TabData<T> {
	label: string;
	value: T;
}

export type Routes = {
	name: string;
	path: string;
	icon: React.ElementType;
};

//USER

export interface User {
	_id?: string;
	id: string;
	name: string;
	email: string;
	photo?: string;
	role: ROLES.admin | ROLES.user | ROLES.technician;
	business: Pick<Business, 'country' | 'businessName'>;
	createdAt?: Date;
	dateOfBirth?: Date;
	inviteToken?: string;

	active?: boolean;
	status?: INVITE_STATUS;
}

export interface Business {
	_id?: string;
	id: string;
	businessName: string;
	registrationId: string;
	businessContact: string;
	country: string;
	businessAddress: string;
	description?: string;
	createdAt?: Date;
	businessEmail: string;
	businessCreator: string;
	logo?: string;
	// businessUsers?: string[]; // Uncomment and adjust if you use this field
	// Add other fields as needed
}

export type UserRowActionsProps = {
	user: User;
};

export type UserRowProps = {
	data?: User[];
};

export type UserQueryprops = {
	handleFilter?: (query: { status?: INVITE_STATUS } | null) => void;
};

export type UserFilterQuery = {
	status?: INVITE_STATUS;
};

export interface ManageUserFormProps {
	user?: User | undefined;
	onCloseModal?: () => void;
}

export interface ManageUserForm {
	name: string;
	email: string;
	role: ROLES.admin | ROLES.user | ROLES.technician;
}

export type CreateUserPayload = Pick<User, 'name' | 'email' | 'role'>;
