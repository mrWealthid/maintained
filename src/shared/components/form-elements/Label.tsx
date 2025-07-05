import React, { FC } from 'react';
import { RiAsterisk } from 'react-icons/ri';

const Label: FC<LabelProps> = ({ name, text, required }) => {
	return (
		<label htmlFor={name} className='block cursor-pointer text-xs'>
			<span className=' flex gap-1 items-center   capitalize'>
				<span>{text}</span>
				{required && <RiAsterisk color='red' />}
			</span>
		</label>
	);
};

export default Label;

interface LabelProps {
	name: string;
	text: string;
	required: boolean;
}
