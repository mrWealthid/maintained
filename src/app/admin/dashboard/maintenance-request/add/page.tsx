'use client';

import React, { useEffect, useState } from 'react';
import TextInput from '@/components/shared/form-elements/Text-Input';
import ButtonComponent from '@/components/shared/form-elements/Button';
import { useForm } from 'react-hook-form';
import AutoComplete from '@/components/shared/auto-complete/AutoComplete';

import { useCreateMaintenanceRequest } from '../hooks/maintenanceHooks';
import { fetchCategory } from '../service/maintenance-service';
import FileUpload from '@/components/shared/form-elements/File-Upload';
import { IoIosCloudUpload } from 'react-icons/io';

import axios from 'axios';
import { RiVideoUploadLine } from 'react-icons/ri';

const MaintenanceForm = ({ maintenance, onCloseModal, settings }: any) => {
	const isEditing = !!maintenance?.id;
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		category: any;
	} | null>(null);

	const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<FileList | null>(null);

	const { register, handleSubmit, getValues, formState } = useForm({
		mode: 'all',
		defaultValues: isEditing ? { ...maintenance } : {},
		values: {
			category: autoCompleteValue?.category?._id,
			images: selectedImages
		}
	});

	const { errors, isSubmitting } = formState;
	const { isCreating, createMaintenance } = useCreateMaintenanceRequest(
		maintenance?.id,
		isEditing,
		onCloseModal
	);

	function handleAutoCompleteValues(values: any) {
		setAutoCompleteValue({ ...autoCompleteValue, ...values });
	}

	async function onSubmit(data: any) {
		// const { category }: any = autoCompleteValue;

		const imgUrls = await handleMultipleUpload(selectedImages!, 'image');
		const videoUrls = await handleMultipleUpload(selectedVideo!, 'video');

		const payload = {
			...data,
			images: imgUrls,
			video: videoUrls
		};

		createMaintenance(payload);
	}

	function onError(err: any) {
		console.log(err);
	}

	function batchUpload(file: FileList, type: 'video' | 'image') {
		return Array.from(file).map(async (fl) => {
			const formData = new FormData();
			/image/.test(type)
				? formData.append('upload_preset', `${process.env.IMG_PRESET}`)
				: formData.append(
						'upload_preset',
						`${process.env.VIDEO_PRESET}`
				  );
			formData.append('file', fl);

			try {
				const response = await uploader(formData, type); // Assuming 'uploader' is your function to handle the upload
				return response; // Return the response or the specific URL part of the response
			} catch (error) {
				console.error('Upload error:', error);
				throw error; // Ensure errors are propagated
			}
		});
	}

	async function handleMultipleUpload(
		file: FileList,
		type: 'video' | 'image'
	) {
		if (!file) return;
		const uploadPromises = batchUpload(file, type);
		try {
			const urls = await Promise.all(uploadPromises);
			return urls; // Now 'urls' contains all the URLs from the resolved promises
		} catch (error) {
			console.error('Error uploading one or more files:', error);
			throw error; // Optionally handle this error further or re-throw
		}
	}

	async function uploader(formData: FormData, type: 'video' | 'image') {
		const uploadResponse = await axios.post(
			`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/${type}/upload`,
			formData
		);
		return uploadResponse.data.url;
	}

	const handleImageSelect = (files: FileList) => {
		if (files.length < 1) return;

		setSelectedImages(files);
	};
	const handleVideoSelect = (files: FileList) => {
		// const vid = file![0];
		// if (vid) {
		// 	// setSelectedVideo(vid);
		// 	// Handle the files, such as uploading them to a server or processing them
		// 	console.log(file);
		// }

		if (files.length < 1) return;

		setSelectedVideo(files);
	};

	function UploadFileIcon() {
		return (
			<svg
				width={20}
				height={20}
				viewBox='0 0 20 20'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				className={''}>
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
		<div className='w-1/2  my-10 flex flex-col gap-4 container-text '>
			<p>Request Maintenance</p>

			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 p-1 sm:p-6  rounded-lg card items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<TextInput
						name={'title'}
						placeholder='Enter Title'
						label='Title'
						error={errors?.['title']?.message?.toString()}>
						<input
							{...register('title', {
								required: 'This field is required'
							})}
							className='input-style'
							type='text'
							disabled={isSubmitting}
							id='title'
						/>
					</TextInput>

					<TextInput
						name={'description'}
						placeholder='Kindly describe'
						label='Description'
						error={errors?.['description']?.message?.toString()}>
						<textarea
							className='input-style'
							{...register('description', {
								required: 'This field is required'
							})}
							disabled={isSubmitting}
							id='description'
							cols={40}
							rows={4}></textarea>
					</TextInput>

					<div>
						<AutoComplete
							queryKey='category'
							service={fetchCategory}
							label={'Category'}
							key={'_id'}
							// custom={'regularPrice'}
							displayValue={'name'}
							handler={handleAutoCompleteValues}
						/>
						<div className='hidden'>
							<TextInput
								name={'category'}
								error={errors?.[
									'category'
								]?.message?.toString()}>
								<input
									title='category'
									{...register('category', {
										required: 'This field is required'
									})}
									className='input-style'
									type='text'
									hidden
									readOnly
									id='category'
								/>
							</TextInput>
						</div>
					</div>

					<TextInput
						name={'Area'}
						placeholder='Enter Title'
						label='Area (Ex. Kitchen)'
						error={errors?.['area']?.message?.toString()}>
						<input
							{...register('area', {
								required: 'This field is required'
							})}
							className='input-style'
							type='text'
							disabled={isSubmitting}
							id='area'
						/>
					</TextInput>
					<section className='w-full flex gap-10 justify-center '>
						<div>
							<FileUpload
								id='image'
								label={'Upload Images'}
								onFileSelect={handleImageSelect}
								multiple={true}
								accept={'image/jpeg, image/png, image/gif'}
								icon={<IoIosCloudUpload />}
							/>
						</div>

						<div>
							<FileUpload
								id='video'
								label={'Upload Videos'}
								onFileSelect={handleVideoSelect}
								multiple={true}
								accept={'video/mp4,video/x-m4v,video/*'}
								icon={<RiVideoUploadLine />}
							/>
							{/* <div className='hidden'>
							<TextInput
								name={'video'}
								error={errors?.['video']?.message?.toString()}>
								<input
									title='images'
									{...register('video', {
										required: 'This field is required'
									})}
									className='input-style'
									type='text'
									hidden
									readOnly
									id='video'
								/>
							</TextInput>
						</div> */}
						</div>
					</section>

					<section className='flex justify-end gap-4'>
						<ButtonComponent
							type='reset'
							handleClick={() => onCloseModal?.()}
							styles='rounded-3xl'
							btnText={'Cancel'}></ButtonComponent>

						<ButtonComponent
							type='submit'
							styles='rounded-3xl'
							// disabled={!formState.isValid || isSubmitting}
							loading={isCreating}
							btnText={` ${
								isEditing ? 'Update Request' : ' Submit Request'
							}`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default MaintenanceForm;
