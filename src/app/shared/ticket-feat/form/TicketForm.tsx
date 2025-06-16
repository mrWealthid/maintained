'use client';

import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoIosCloudUpload } from 'react-icons/io';

import axios from 'axios';
import { RiVideoUploadLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { fetchTicketCategory } from '../service/ticket-service';
import { ManageTicketForm, ManageTicketFormProps } from '../model/ticket.model';

import { useCreateTicket } from '../hooks/ticketHooks';
import { Category, CreateTicketPayload } from '../../model/model';
import TextInput from '../../components/form-elements/Text-Input';
import AutoComplete from '../../components/auto-complete/AutoComplete';
import FileUpload from '../../components/form-elements/File-Upload';
import ButtonComponent from '../../components/form-elements/Button';

const TicketForm: FC<ManageTicketFormProps> = ({ ticket }) => {
	const isEditing = !!ticket?._id;
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		category: Category;
	} | null>(null);

	const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<FileList | null>(null);
	const [uploadProgress, setUploadProgress] = useState<
		Record<string, number>
	>({});

	const { register, handleSubmit, getValues, setValue, formState } =
		useForm<ManageTicketForm>({
			mode: 'all',
			defaultValues: isEditing
				? {
						...ticket,
						category:
							typeof ticket.category === 'object'
								? ticket.category._id
								: ticket.category
					}
				: {}
		});

	const router = useRouter();
	const { errors, isValid, isDirty } = formState;
	const { isCreating, handleCreateTicket } = useCreateTicket(
		isEditing,
		ticket?.id
	);

	const [isUploading, setIsUploading] = useState(false);
	const isSubmitting = isUploading || isCreating;

	function handleAutoCompleteValues(values: any) {
		setAutoCompleteValue({ ...autoCompleteValue, ...values });
		if (values.category) setValue('category', values.category._id);
	}

	async function onSubmit(data: ManageTicketForm) {
		console.log('Submitting form:', data);
		const imgUrls = await handleMultipleUpload(selectedImages!, 'image');
		const videoUrls = await handleMultipleUpload(selectedVideo!, 'video');

		const payload = BuildRequestPayload(data, imgUrls, videoUrls);

		handleCreateTicket(payload, {
			onSuccess: () => {
				router.push('/dashboard/maintenance-request');
			}
		});
	}

	function BuildRequestPayload(
		data: ManageTicketForm,
		imgUrls?: string[],
		videoUrls?: string[]
	): CreateTicketPayload {
		return {
			...data,
			images: imgUrls,
			videos: videoUrls,
			...(isEditing && {
				status: ticket?.status
			})
		};
	}

	function onError(err: any) {
		console.log(err);
	}

	function batchUpload(
		fileList: FileList,
		type: 'video' | 'image',
		setProgress?: (fileName: string, percent: number) => void
	) {
		return Array.from(fileList).map(async (file) => {
			const formData = new FormData();
			formData.append(
				'upload_preset',
				type === 'image'
					? process.env.IMG_PRESET!
					: process.env.VIDEO_PRESET!
			);
			formData.append('file', file);

			try {
				const response = await axios.post(
					`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/${type}/upload`,
					formData,
					{
						onUploadProgress: (event) => {
							const percent = Math.round(
								(event.loaded * 100) / (event.total ?? 1)
							);
							if (setProgress) setProgress(file.name, percent);
						}
					}
				);

				return response.data.url;
			} catch (error) {
				console.error('Upload error:', error);
				throw error;
			}
		});
	}

	async function handleMultipleUpload(
		file: FileList,
		type: 'video' | 'image'
	) {
		if (!file) return;
		setIsUploading(true);
		const uploadPromises = batchUpload(file, type, updateProgress);
		try {
			const urls = await Promise.all(uploadPromises);
			return urls;
		} catch (error) {
			console.error('Error uploading one or more files:', error);
			throw error;
		} finally {
			setIsUploading(false); // upload ended
		}
	}

	// async function uploader(formData: FormData, type: 'video' | 'image') {
	// 	const uploadResponse = await axios.post(
	// 		`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/${type}/upload`,
	// 		formData
	// 	);
	// 	return uploadResponse.data.url;
	// }

	const handleImageSelect = (files: FileList) => {
		if (files.length < 1) return;
		setSelectedImages(files);
	};
	const handleVideoSelect = (files: FileList) => {
		if (files.length < 1) return;

		setSelectedVideo(files);
	};

	const updateProgress = (fileName: string, percent: number) => {
		setUploadProgress((prev) => ({
			...prev,
			[fileName]: percent
		}));
	};

	return (
		<div className='lg:w-2/3  flex flex-col gap-4 lg:container-text'>
			<section className='flex justify-between items-center'>
				<h3>Request Maintenance</h3>
			</section>

			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className='flex flex-1 p-6 rounded-lg card  items-center'>
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
						<AutoComplete<Category>
							queryKey='category'
							service={fetchTicketCategory}
							label={'Category'}
							optionKey={'_id'}
							// custom={'regularPrice'}
							displayValue={'name'}
							initialValue={ticket?.category}
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
					<section className='w-full items-start flex-col lg:flex-row flex gap-10'>
						<div className=' w-full lg:w-1/2  bg-gray-50  p-2 rounded-2xl'>
							<FileUpload
								id='image'
								label={'Upload Images'}
								onFileSelect={handleImageSelect}
								multiple={true}
								accept={'image/jpeg, image/png, image/gif'}
								icon={<IoIosCloudUpload />}
								selectedFiles={selectedImages}
								uploadProgress={uploadProgress}
							/>
						</div>

						<div className='w-full lg:w-1/2 bg-gray-50  p-2 rounded-2xl'>
							<FileUpload
								id='video'
								label={'Upload Videos'}
								onFileSelect={handleVideoSelect}
								multiple={true}
								accept={'video/mp4,video/x-m4v,video/*'}
								icon={<RiVideoUploadLine />}
								selectedFiles={selectedVideo}
								uploadProgress={uploadProgress}
							/>
						</div>
					</section>

					<hr className='-mx-6 my-3' />
					<section className='flex justify-end  gap-4'>
						{/* <ButtonComponent
                            type='reset'
                            styles='rounded-3xl'
                            btnText={'Cancel'}></ButtonComponent> */}

						<ButtonComponent
							type='submit'
							styles=' w-1/3'
							disabled={!isValid || isSubmitting || !isDirty}
							loading={isSubmitting}
							btnText={` ${
								isEditing ? 'Update' : 'Submit'
							} Request`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default TicketForm;
