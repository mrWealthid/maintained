import React, { ChangeEvent, useState } from 'react';

interface FileUploadProps {
	label: string;
	accept: string;
	multiple: boolean;
	id: string;
	icon: any;
	onFileSelect: (files: FileList) => void; // Callback function to pass the selected files to the parent component
}

const FileUpload: React.FC<FileUploadProps> = ({
	onFileSelect,
	label,
	accept,
	multiple,
	id,
	icon
}) => {
	const [selected, setSelected] = useState<FileList | null>(null);
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		onFileSelect(event.target.files!);
		setSelected(event.target.files);
	};

	function UploadFileIcon() {
		return (
			<svg
				width={20}
				height={20}
				viewBox='0 0 20 20'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				className='text-primary'>
				<path
					d='M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5'
					stroke='#E80F6D'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
				<path
					d='M14.1673 6.66667L10.0007 2.5L5.83398 6.66667'
					stroke='#E80F6D'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
				<path
					d='M10 2.5V12.5'
					stroke='#E80F6D'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		);
	}

	return (
		<div>
			<label className='text-xs'>{label}</label>
			<label
				className='bg-blue-100 p-4 flex flex-col gap-2 cursor-pointer rounded-lg justify-center items-center h-32'
				htmlFor={id}>
				{/* <UploadFileIcon /> */}
				{icon}
				<small>Single/Multiple Selection</small>
			</label>
			<input
				title='filepicker'
				type='file'
				onChange={handleFileChange}
				accept={accept}
				multiple={multiple}
				className=' hidden p-1'
				id={id}
			/>
			{selected && (
				<div className='flex flex-col mt-2 gap-2'>
					<small>Selected files:</small>
					<ul className=' flex flex-col   gap-2'>
						{Array.from(selected).map((file, index) => (
							<li
								className='bg-gray-50 inline text-xs p-2 rounded-lg'
								key={file.name}>
								{file.name}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default FileUpload;
