import { INVITE_STATUS, ROLES } from '@/utils/enums';

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
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
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
	role: ROLES.admin | ROLES.user;
	business: Pick<Business, 'country' | 'businessName'>;
	createdAt?: Date;
	dateOfBirth?: Date;
	inviteToken?: string;

	active?: boolean;
	status?:
		| INVITE_STATUS.invited
		| INVITE_STATUS.activated
		| INVITE_STATUS.declined;
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
	firstName: string;
	lastName: string;
	email: string;
	role: ROLES;
}

export type CreateUserPayload = Pick<User, 'name' | 'email' | 'role'>;
