import React, { FC } from 'react';
import { MdOutlineErrorOutline } from 'react-icons/md';

interface ErrorMessageProps {
	errorMsg: string;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ errorMsg }) => {
	return (
		<div className='flex mt-2 gap-1 items-center'>
			<MdOutlineErrorOutline color='#dc2626' />
			<span className='input-error-msg'>{errorMsg}</span>
		</div>
	);
};

export default ErrorMessage;
