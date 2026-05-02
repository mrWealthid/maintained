import React, { FC } from 'react';

const Label: FC<LabelProps> = ({ name, text, required }) => {
	return (
		<label htmlFor={name} className='block cursor-pointer text-xs'>
			<span className=' flex gap-1 items-center   capitalize'>
				<span>{text}</span>
				{required && <span className='text-destructive'>*</span>}
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
