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
import { ROUTES_DEFINITION } from '../../routes/routes';

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
	const [isUploading, setIsUploading] = useState(false);

	const initialImageFiles =
		isEditing && Array.isArray(ticket?.images)
			? ticket.images.map((url) => ({
					url,
					type: 'image/',
					id: url
				}))
			: [];

	const initialVideoFiles =
		isEditing && Array.isArray(ticket?.videos)
			? ticket.videos.map((url) => ({
					url,
					type: 'video/',
					id: url
				}))
			: [];
	const [remainingImages, setRemainingImages] = useState(initialImageFiles);
	const [remainingVideos, setRemainingVideos] = useState(initialVideoFiles);
	const router = useRouter();

	const { register, handleSubmit, setValue, formState } =
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
	const { errors, isValid, isDirty } = formState;
	const { isCreating, handleCreateTicket } = useCreateTicket(
		isEditing,
		ticket?._id
	);

	const isSubmitting = isUploading || isCreating;

	// const handleRemoveInitialImage = (file: { url: string }) => {
	// 	setRemainingImages((prev) => prev.filter((f) => f.url !== file.url));
	// };
	// const handleRemoveInitialVideo = (file: { url: string }) => {
	// 	setRemainingVideos((prev) => prev.filter((f) => f.url !== file.url));
	// };
	function getCloudinaryPublicId(url: string) {
		const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
		return matches ? matches[1] : '';
	}

	const handleRemoveInitialImage = async (file: { url: string }) => {
		const publicId = getCloudinaryPublicId(file.url);

		try {
			await fetch('/api/cloudinary', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicId, resourceType: 'image' })
			});
		} catch (err) {
			console.error('Failed to delete image from Cloudinary', err);
		}
		setRemainingImages((prev) => prev.filter((f) => f.url !== file.url));
	};

	const handleRemoveInitialVideo = async (file: { url: string }) => {
		const publicId = getCloudinaryPublicId(file.url);
		try {
			await fetch('/api/cloudinary', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicId, resourceType: 'video' })
			});
		} catch (err) {
			console.error('Failed to delete video from Cloudinary', err);
		}
		setRemainingVideos((prev) => prev.filter((f) => f.url !== file.url));
	};

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
				router.push(ROUTES_DEFINITION.DASHBOARD.TICKETS);
			}
		});
	}

	function BuildRequestPayload(
		data: ManageTicketForm,
		imgUrls?: string[],
		videoUrls?: string[]
	): CreateTicketPayload {
		let images: string[] = [];
		let videos: string[] = [];

		if (isEditing) {
			const existingImages = remainingImages.map((f) => f.url);
			const existingVideos = remainingVideos.map((f) => f.url);
			images = [...existingImages, ...(imgUrls || [])];
			videos = [...existingVideos, ...(videoUrls || [])];
		} else {
			images = imgUrls || [];
			videos = videoUrls || [];
		}

		return {
			...data,
			images,
			videos,
			...(isEditing && {
				status: ticket?.status
			})
		};
	}

	function onError(err: any) {
		console.log(err);
	}

	// function batchUpload(
	// 	fileList: FileList,
	// 	type: 'video' | 'image',
	// 	setProgress?: (fileName: string, percent: number) => void
	// ) {
	// 	return Array.from(fileList).map(async (file) => {
	// 		const formData = new FormData();
	// 		formData.append(
	// 			'upload_preset',
	// 			type === 'image'
	// 				? process.env.IMG_PRESET!
	// 				: process.env.VIDEO_PRESET!
	// 		);
	// 		formData.append('file', file);

	// 		try {
	// 			const response = await axios.post(
	// 				`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/${type}/upload`,
	// 				formData,
	// 				{
	// 					onUploadProgress: (event) => {
	// 						const percent = Math.round(
	// 							(event.loaded * 100) / (event.total ?? 1)
	// 						);
	// 						if (setProgress) setProgress(file.name, percent);
	// 					}
	// 				}
	// 			);

	// 			return response.data.url;
	// 		} catch (error) {
	// 			console.error('Upload error:', error);
	// 			throw error;
	// 		}
	// 	});
	// }

	function batchUpload(
		fileList: FileList,
		type: 'video' | 'image',
		setProgress?: (fileName: string, percent: number) => void
	) {
		return Array.from(fileList).map(async (file) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('resourceType', type);

			try {
				const response = await axios.post('/api/cloudinary', formData, {
					onUploadProgress: (event) => {
						const percent = Math.round(
							(event.loaded * 100) / (event.total ?? 1)
						);
						if (setProgress) setProgress(file.name, percent);
					},
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});

				return response.data.secure_url || response.data.url;
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
		<div className='lg:w-2/3  flex flex-col gap-4'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className='flex flex-1 p-6 rounded-lg border items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<section className='flex mb-5 justify-between items-center'>
						<h3>Create Maintenance Ticket</h3>
					</section>

					<TextInput
						name={'title'}
						placeholder='Enter Title'
						label='Title'
						required={true}
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
						required={true}
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
						{/* Autocomplete usage with static data */}
						{/* <AutoComplete<Category>
							queryKey='category'
							// service={fetchTicketCategory}
							label={'Category'}
							optionKey={'_id'}
							// custom={'regularPrice'}
							displayValue={'name'}
							initialValue={ticket?.category}
							handler={handleAutoCompleteValues}
							staticData={[
								{
									_id: '2222y2y22',
									id: '2222y2y22',
									name: 'Electrical',
									description:
										'Issues related to electrical wiring, lighting, and power outlets.'
								},
								{
									_id: '2222y2y223',
									id: '2222y2y223',

									name: 'Plumbing',
									description:
										'Problems with water supply, drainage, leaks, and pipes.'
								},
								{
									_id: '2222y2y228',
									id: '2222y2y228',
									name: 'HVAC',
									description:
										'Heating, ventilation, and air conditioning system repairs.'
								},
								{
									_id: '2222y2y2290',
									id: '2222y2y2290',

									name: 'Carpentry',
									description:
										'Woodwork repairs, doors, windows, and furniture.'
								},
								{
									_id: '2222y2y22qw',
									id: '2222y2y22qw',
									name: 'Appliance',
									description:
										'Repairs for household or office appliances.'
								},
								{
									_id: '2222y2y22op',
									id: '2222y2y22op',
									name: 'Painting',
									description:
										'Wall, ceiling, or surface painting and touch-ups.'
								},
								{
									_id: '2222y242',
									id: '2222y242',
									name: 'Pest Control',
									description:
										'Issues with insects, rodents, or other pests.'
								},
								{
									_id: '2239222',
									id: '2239222',
									name: 'General Maintenance',
									description:
										'Other maintenance requests not covered by specific categories.'
								}
							]}
						/> */}

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
						name={'area'}
						placeholder='Enter Area'
						required={true}
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
						<div className=' w-full lg:w-1/2  border  p-2 rounded-2xl'>
							<FileUpload
								id='image'
								label={'Upload Images'}
								onFileSelect={handleImageSelect}
								multiple={true}
								accept={'image/*'}
								icon={<IoIosCloudUpload />}
								selectedFiles={selectedImages}
								uploadProgress={uploadProgress}
								initialFiles={initialImageFiles}
								onRemoveInitialFile={handleRemoveInitialImage}
							/>
						</div>

						<div className='w-full lg:w-1/2 border  p-2 rounded-2xl'>
							<FileUpload
								id='video'
								label={'Upload Videos'}
								onFileSelect={handleVideoSelect}
								multiple={true}
								accept={'video/*'}
								icon={<RiVideoUploadLine />}
								selectedFiles={selectedVideo}
								uploadProgress={uploadProgress}
								initialFiles={initialVideoFiles}
								onRemoveInitialFile={handleRemoveInitialVideo}
							/>
						</div>
					</section>

					<hr className='-mx-6 my-3' />
					<section className='flex justify-end   gap-4'>
						{/* <ButtonComponent
                            type='reset'
                            styles='rounded-3xl'
                            btnText={'Cancel'}></ButtonComponent> */}

						<ButtonComponent
							type='submit'
							styles='w-1/2 md:w-1/3  '
							disabled={!isValid || isSubmitting || !isDirty}
							loading={isSubmitting}
							btnText={` ${
								isEditing ? 'Update' : 'Create'
							}`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default TicketForm;
