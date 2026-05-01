import React, { FC, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

const PasswordInput: FC<PasswordProps> = ({
	label,
	placeholder,
	type = 'text',
	name,
	style,
	error,
	children,
	required = true
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const togglePassword = () => {
		setShowPassword(!showPassword);
	};
	return (
		<div className='w-full'>
			{label && <Label name={name} text={label} required={required} />}
			<div className='flex items-center'>
				{children || (
					<input
						type={type}
						required
						name={name}
						className={`input-style  ${style}`}
						placeholder={placeholder}
					/>
				)}
				{!showPassword ? (
					<FaEyeSlash
						className='text-status-resolved cursor-pointer'
						onClick={togglePassword}
					/>
				) : (
					<FaEye
						className='text-status-resolved cursor-pointer'
						onClick={togglePassword}
					/>
				)}
			</div>
			{error && <ErrorMessage errorMsg={error} />}
		</div>
	);
};

// PasswordInput.propTypes = {
// 	control: PropTypes.string,
// 	changeHandler: PropTypes.func
// };

interface PasswordProps {
	label?: string;
	name: string;
	placeholder?: string;
	type?: string;
	style?: string;
	error?: string;
	children?: React.ReactNode;
	control: string;
	changeHandler: Function;
	required: boolean;
}
export default PasswordInput;
