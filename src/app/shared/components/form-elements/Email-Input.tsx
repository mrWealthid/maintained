import React, { FC } from 'react';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

const EmailInput: FC<EmailInputProps> = ({
	label,
	name,
	style,
	children,
	error,
	required = true
}) => {
	return (
		<div className='w-full'>
			{label && <Label name={name} text={label} required={required} />}
			{children || (
				<input
					type='email'
					required
					name={name}
					className={`input-style  ${style}`}
					placeholder={'Enter your email'}
				/>
			)}
			{error && <ErrorMessage errorMsg={error} />}
		</div>
	);
};

interface EmailInputProps {
	label?: string;
	name: string;
	error?: string;
	children?: React.ReactNode;
	style?: string;
	required: boolean;
}

export default EmailInput;
