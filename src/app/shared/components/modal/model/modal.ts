export interface ModalProps {
	children: React.ReactNode;
	size?: string;
}

export interface OpenProps {
	children: React.ReactElement;
	opens: string;
}

export interface WindowProps {
	name: string;
	title: string;
	description?: string;
	children: React.ReactElement<{ onCloseModal?: () => void }>;
	size?: string;
	closeOnOutsideClick?: boolean;
}

export interface ModalContextProps {
	openName: string;
	close: () => void;
	open: (name: string) => void;
	title?: string;
	description?: string;
}
