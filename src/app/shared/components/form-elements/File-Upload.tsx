import React, { ChangeEvent, ReactNode, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { FileUploadPreview } from '../../model/model';
import { RiAsterisk } from 'react-icons/ri';
import toast from 'react-hot-toast';

interface FileUploadProps {
	label: string;
	accept: string;
	multiple: boolean;
	id: string;
	icon: ReactNode;
	onFileSelect: (files: FileList) => void;
	onPreviewFileRemove: (file: File) => void; // optional
	uploadProgress?: Record<string, number>;
	required?: boolean;
	initialFiles?: { url: string; type: string; id?: string | number }[]; // <-- Add this
	onRemoveInitialFile?: (
		file: {
			url: string;
			type: string;
			id?: string | number;
		},
		type: 'image' | 'video'
	) => void; // optional
}

const FileUpload: React.FC<FileUploadProps> = ({
	onFileSelect,
	label,
	accept,
	multiple,
	id,
	icon,
	uploadProgress,
	required = false,
	initialFiles = [],
	onRemoveInitialFile,
	onPreviewFileRemove
}) => {
	const [selected, setSelected] = useState<FileList | null>(null);
	const [previews, setPreviews] = useState<FileUploadPreview[]>([]);
	const [existingFiles, setExistingFiles] = useState(initialFiles);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		onFileSelect(files);
		setSelected(files);
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
			if (toRemove) URL.revokeObjectURL(toRemove.url);
			return prev.filter((p) => p.id !== id);
		});
		onPreviewFileRemove?.(previews.find((p) => p.id === id)?.file as File);
	};

	const handleRemoveExisting = (
		file: {
			url: string;
			type: string;
			id?: string | number;
		},
		type: 'image' | 'video'
	) => {
		setExistingFiles((prev) => prev.filter((f) => f.url !== file.url));
		onRemoveInitialFile?.(file, type);
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

	//Drag and drop feature

	const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const files = Array.from(event.dataTransfer.files);

		const allowedType = accept.split('/')[0]; // "image" or "video"

		const validFiles = files.filter((file) =>
			file.type.startsWith(allowedType)
		);

		if (validFiles.length === 0) {
			toast.error(
				`Only ${allowedType} files are allowed in this drop zone.`
			);
		}

		onFileSelect(validFiles as unknown as FileList);
		setSelected(validFiles as unknown as FileList);

		const newPreviews: FileUploadPreview[] = validFiles.map((file, i) => ({
			id: Date.now() + i,
			url: URL.createObjectURL(file),
			type: file.type,
			file,
			uploadProgress: 0
		}));

		setPreviews(newPreviews);
	};

	// const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
	// 	event.preventDefault();
	// 	setIsDragging(false);
	// 	const files = event.dataTransfer.files;
	// 	if (!files) return;
	// 	onFileSelect(files);
	// 	setSelected(files);
	// 	const newPreviews: FileUploadPreview[] = Array.from(files).map(
	// 		(file, i) => ({
	// 			id: Date.now() + i,
	// 			url: URL.createObjectURL(file),
	// 			type: file.type,
	// 			file,
	// 			uploadProgress: 0
	// 		})
	// 	);
	// 	setPreviews(newPreviews);
	// };

	return (
		<div>
			<label htmlFor={id} className='text-xs cursor-pointer'>
				{label}
			</label>
			<label
				htmlFor={id}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className=' p-4 flex flex-col gap-2 cursor-pointer border  rounded-lg justify-center items-center h-32'>
				<span className='p-4  bg-secondary text-green-600 rounded-full'>
					{icon}
				</span>
				<span className='text-xs text-gray-500'>
					Select a file or drag and drop here
				</span>
				{required && <RiAsterisk color='red' />}
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

			{(existingFiles.length > 0 || previews.length > 0) && (
				<div className='mt-4 grid grid-cols-2 gap-4'>
					{/* Existing files */}
					{existingFiles.map((file, idx) => (
						<div
							key={file.id || file.url}
							className='relative rounded-md border p-1'>
							<button
								onClick={() =>
									handleRemoveExisting(
										file,
										file.type.startsWith('image/')
											? 'image'
											: 'video'
									)
								}
								className='absolute top-1 cursor-pointer z-10 right-1  rounded-full p-1 shadow '
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
						</div>
					))}
					{/* New previews */}
					{previews.map((file) => {
						const progress = uploadProgress?.[file.file.name] ?? 0;
						const angle = Math.round(progress * 3.6);
						return (
							<div
								key={file.id}
								className='relative rounded-md border p-1'>
								<button
									onClick={() => handleRemovePreview(file.id)}
									className='absolute top-1 cursor-pointer z-10 right-1 rounded-full p-1 shadow'
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
													background: `conic-gradient(green ${angle}deg, #e5e7eb 0deg)`
												}}
											/>
											<div className='absolute inset-1 rounded-full  flex items-center justify-center text-xs font-medium '>
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
