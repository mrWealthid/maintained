import React from 'react';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

const TextInput = ({
	label,
	placeholder,
	type = 'text',
	name,
	style,
	error,
	children,
	required = true
}: ITextInput) => {
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

interface ITextInput {
	label?: string;
	name: string;
	placeholder?: string;
	type?: string;
	style?: string;
	error?: string;
	children?: React.ReactNode;
	required?: boolean;
}

// interface IFormErrors {}

export default TextInput;
