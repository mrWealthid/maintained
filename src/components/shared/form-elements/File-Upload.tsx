import React, { ChangeEvent, useState } from 'react';
import { FileUploadPreview } from '../model/model';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface FileUploadProps {
	label: string;
	accept: string;
	multiple: boolean;
	id: string;
	icon: any;
	onFileSelect: (files: FileList) => void; // Callback function to pass the selected files to the parent component
	selectedFiles?: FileList | null;
	uploadProgress?: Record<string, number>;
}

const FileUpload: React.FC<FileUploadProps> = ({
	onFileSelect,
	label,
	accept,
	multiple,
	id,
	icon,
	uploadProgress
}) => {
	const [selected, setSelected] = useState<FileList | null>(null);
	const [previews, setPreviews] = useState<FileUploadPreview[]>([]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		onFileSelect(event.target.files!);
		setSelected(event.target.files);
		const newPreviews: FileUploadPreview[] = Array.from(files).map(
			(file, i) => ({
				id: Date.now() + i,
				url: URL.createObjectURL(file),
				type: file.type,
				file,
				uploadProgress: 0
			})
		);
		setPreviews(newPreviews);
	};

	const handleRemovePreview = (id: number) => {
		setPreviews((prev) => {
			const toRemove = prev.find((p) => p.id === id);
			if (toRemove) URL.revokeObjectURL(toRemove.url); // cleanup
			return prev.filter((p) => p.id !== id);
		});
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
			<label htmlFor={id} className='text-xs cursor-pointer'>
				{label}
			</label>
			<label
				htmlFor={id}
				className='bg-gray-100 p-4 flex flex-col gap-2 cursor-pointer rounded-lg justify-center items-center h-32'>
				<span className='glass p-4  rounded-full'>{icon}</span>
				{/* <small>Single/Multiple Selection</small> */}
			</label>
			<input
				title='filepicker'
				type='file'
				onChange={handleFileChange}
				accept={accept}
				multiple={multiple}
				className='hidden p-1'
				id={id}
			/>

			{previews.length > 0 && (
				<div className='mt-4 grid grid-cols-2 gap-4'>
					{previews.map((file) => {
						const progress = uploadProgress?.[file.file.name] ?? 0;
						const angle = Math.round(progress * 3.6); // convert % to degrees
						return (
							<div
								key={file.id}
								className='relative rounded-md border p-1'>
								<button
									onClick={() => handleRemovePreview(file.id)}
									className='absolute top-1 cursor pointer z-10 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100'
									title='Remove'>
									<FaTimes size={16} />
								</button>

								{file.type.startsWith('image/') ? (
									<Image
										src={file.url}
										alt='preview'
										width={100}
										height={100}
										className='w-full h-32 object-cover rounded-md'
									/>
								) : file.type.startsWith('video/') ? (
									<video
										src={file.url}
										controls
										className='w-full h-32 object-cover rounded-md'
									/>
								) : (
									<p>Unsupported file type</p>
								)}

								{progress > 0 && progress <= 100 && (
									<div className='absolute inset-0 flex items-center justify-center z-20'>
										<div className='relative w-10 h-10'>
											<div
												className='absolute inset-0 rounded-full'
												style={{
													background: `conic-gradient(green ${
														angle
													}deg, #e5e7eb 0deg)`
												}}
											/>
											<div className='absolute inset-1 rounded-full bg-white flex items-center justify-center text-xs font-medium text-gray-800'>
												{progress}%
											</div>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default FileUpload;
