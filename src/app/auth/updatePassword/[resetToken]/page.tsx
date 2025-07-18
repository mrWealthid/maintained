import { FC } from 'react';
import { UpdatePasswordForm } from './UpdatePasswordForm';

const UpdatePasswordComponent: FC<{
	params: Promise<{ resetToken: string }>;
}> = async ({ params }) => {
	const { resetToken } = await params;

	return <UpdatePasswordForm token={resetToken} />;
};

export default UpdatePasswordComponent;
