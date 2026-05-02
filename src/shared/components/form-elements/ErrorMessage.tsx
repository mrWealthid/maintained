import React, { FC } from 'react';
import { CircleAlert } from 'lucide-react';

interface ErrorMessageProps {
	errorMsg: string;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ errorMsg }) => {
	return (
		<div className='flex mt-2 gap-1 items-center'>
			<CircleAlert className='h-4 w-4 text-destructive' />
			<span className='input-error-msg'>{errorMsg}</span>
		</div>
	);
};

export default ErrorMessage;
