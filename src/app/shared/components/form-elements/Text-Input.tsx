import React, { FC } from 'react';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

const TextInput: FC<TextInputProps> = ({
	label,
	placeholder,
	type = 'text',
	name,
	style,
	error,
	children,
	required = false
}) => {
	return (
		<div className='w-full'>
			{label && <Label name={name} text={label} required={required} />}

			{children || (
				<input
					type={type}
					required={required}
					name={name}
					className={`input-style  ${style}`}
					placeholder={placeholder}
				/>
			)}

			{error && <ErrorMessage errorMsg={error} />}
		</div>
	);
};

interface TextInputProps {
	label?: string;
	name: string;
	placeholder?: string;
	type?: string;
	style?: string;
	error?: string;
	children?: React.ReactNode;
	required?: boolean;
}

export default TextInput;
