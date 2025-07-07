'use client';
import React, { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IoIosCloudUpload } from 'react-icons/io';
import axios from 'axios';
import { RiVideoUploadLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { fetchTicketCategory } from '../service/ticket-service';
import { ManageTicketForm, ManageTicketFormProps } from '../model/ticket.model';
import { useCreateTicket, useFetchTicketType } from '../hooks/ticketHooks';
import { Category, CreateTicketPayload, TicketType } from '../../model/model';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import AutoComplete from '@/app/shared/components/auto-complete/AutoComplete';
import FileUpload from '@/app/shared/components/form-elements/File-Upload';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { ROUTES_DEFINITION } from '../../routes/routes';
import toast from 'react-hot-toast';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import Label from '../../components/form-elements/Label';

const TicketForm: FC<ManageTicketFormProps> = ({ ticket }) => {
	const isEditing = !!ticket?._id;
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		category: Category;
	} | null>(null);
	const [uploadProgress, setUploadProgress] = useState<
		Record<string, number>
	>({});
	const [isUploading, setIsUploading] = useState(false);
	const [uploadResults, setUploadResults] = useState<Record<string, string>>(
		{}
	);

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
	const { data } = useFetchTicketType<TicketType>();

	//form controls
	const { register, handleSubmit, control, setValue, formState, getValues } =
		useForm<ManageTicketForm>({
			mode: 'all',
			defaultValues: isEditing
				? {
						title: ticket.title,
						description: ticket.description,
						area: ticket.area,
						type: ticket.type,
						category:
							typeof ticket.category === 'object'
								? ticket.category._id
								: ticket.category,
						images: undefined,
						videos: undefined
					}
				: {}
		});
	const { errors, isValid, isDirty } = formState;

	// Handle auto-complete values
	function handleAutoCompleteValues(values: any) {
		setAutoCompleteValue({ ...autoCompleteValue, ...values });
		if (values.category) setValue('category', values.category._id);
	}

	// Create ticket mutation
	const { isCreating, handleCreateTicket } = useCreateTicket(
		isEditing,
		ticket?._id
	);

	const isSubmitting = isUploading || isCreating;

	function getCloudinaryPublicId(url: string) {
		const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
		return matches ? matches[1] : '';
	}

	const handleRemoveInitialAsset = async (
		file: { url: string },
		resourceType: 'image' | 'video'
	) => {
		const publicId = getCloudinaryPublicId(file.url);

		try {
			await fetch('/api/cloudinary', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicId, resourceType })
			});

			const updateState = {
				image: setRemainingImages,
				video: setRemainingVideos
			};

			const formFieldKey = {
				image: 'images',
				video: 'videos'
			} as const;

			// Remove from component state
			updateState[resourceType]((prev) =>
				prev.filter((f) => f.url !== file.url)
			);

			// Update form state
			const currentValue = getValues()[formFieldKey[resourceType]];
			const updated = currentValue
				? Array.from(currentValue).filter(
						(f: any) => f.url !== file.url
					)
				: [];

			const updatedFileList =
				updated.length > 0 && updated[0] instanceof File
					? fileArrayToFileList(updated)
					: null;

			setValue(formFieldKey[resourceType], updatedFileList, {
				shouldDirty: true,
				shouldValidate: true,
				shouldTouch: true
			});

			toast.success(`${resourceType} deleted successfully`);
		} catch (err) {
			toast.error(`Failed to delete ${resourceType} ${err}`);
		}
	};

	// Convert File[] to FileList if needed
	function fileArrayToFileList(files: File[]): FileList {
		const dataTransfer = new DataTransfer();
		files.forEach((file) => dataTransfer.items.add(file));
		return dataTransfer.files;
	}

	/* @Param {ManageTicketForm} data - The form data submitted by the user.
  		@returns {Promise<void>} - A promise that resolves when the ticket is successfully created or updated.
  		@description - This function handles the form submission for creating or updating a maintenance ticket.
  		It uploads any selected images and videos to Cloudinary, builds the request payload with the form data and uploaded URLs, and then calls the `handleCreateTicket` function to perform the actual ticket creation or update operation.
  		If the operation is successful, it redirects the user to the tickets dashboard.
  		If there is an error during the upload or ticket creation process, it logs the error to the console.
	*/

	async function onSubmit(data: ManageTicketForm) {
		console.log('Submitting form:', data);
		const imgUrls = await handleMultipleUpload(
			getValues().images!,
			'image'
		);
		const videoUrls = await handleMultipleUpload(
			getValues().videos!,
			'video'
		);

		const payload = BuildRequestPayload(data, imgUrls, videoUrls);

		handleCreateTicket(payload, {
			onSuccess: () => {
				router.push(ROUTES_DEFINITION.DASHBOARD.TICKETS);
			}
		});
	}

	/* 			@Param {ManageTicketForm} data - The form data submitted by the user.
		  		@Param {string[]} imgUrls - An optional array of image URLs to include in the ticket payload.
		  		@Param {string[]} videoUrls - An optional array of video URLs to include in the ticket payload.
		  		@returns {CreateTicketPayload} - The constructed payload for creating or updating a ticket.
		  		@description - This function builds the request payload for creating or updating a maintenance ticket.
		  		It combines the form data with any uploaded image and video URLs, ensuring that existing images and videos are preserved if the ticket is being edited.
		  		If the ticket is being edited, it merges the existing images and videos with any new uploads.
		  		If the ticket is being created, it simply uses the provided image and video URLs.
		  		The function also includes the current ticket status if the ticket is being edited.
				*/

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

	/* 	@Param {FileList} fileList - The list of files to be uploaded.
		@Param {string} type - The type of files being uploaded, either 'video' or 'image'.
		@Param {function} setProgress - An optional callback function to update the upload progress for each file.
		@returns {Promise<string[]>} - A promise that resolves to an array of URLs for the successfully uploaded files.
	*/

	function batchUpload(
		fileList: FileList,
		type: 'video' | 'image',
		setProgress?: (fileName: string, percent: number) => void
	) {
		return Array.from(fileList).map(async (file) => {
			// ✅ Check if already uploaded
			if (uploadResults[file.name]) {
				return uploadResults[file.name]; // reuse cached result
			}

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
				const url = response.data.secure_url || response.data.url;

				setUploadResults((prev) => ({ ...prev, [file.name]: url }));

				return url;
			} catch (error) {
				console.error('Upload error:', error);
				throw error;
			}
		});
	}

	// I prefered to keep the above because it gave me accurate progress updates from cloudinary,
	// but this is an alternative approach that uses the server-side API route
	// to handle uploads (downside: you progress upload  when it it's your server not cloudinary ). It can be useful if you want to avoid direct client-side uploads
	// to Cloudinary and manage uploads through your own backend.
	// This approach is commented out but can be used if needed.

	// function batchUpload(
	// 	fileList: FileList,
	// 	type: 'video' | 'image',
	// 	setProgress?: (fileName: string, percent: number) => void
	// ) {
	// 	return Array.from(fileList).map(async (file) => {
	// 		const formData = new FormData();
	// 		formData.append('file', file);
	// 		formData.append('resourceType', type);

	// 		try {
	// 			const response = await axios.post('/api/cloudinary', formData, {
	// 				onUploadProgress: (event) => {
	// 					const percent = Math.round(
	// 						(event.loaded * 100) / (event.total ?? 1)
	// 					);
	// 					if (setProgress) setProgress(file.name, percent);
	// 				},
	// 				headers: {
	// 					'Content-Type': 'multipart/form-data'
	// 				}
	// 			});

	// 			return response.data.secure_url || response.data.url;
	// 		} catch (error) {
	// 			console.error('Upload error:', error);
	// 			throw error;
	// 		}
	// 	});
	// }

	/* @Param {FileList} file - The list of files to be uploaded.
		@Param {string} type - The type of files being uploaded, either 'video' or 'image'.
		@Param {function} setProgress - A callback function to update the upload progress for each file.
		@returns {Promise<string[]>} - A promise that resolves to an array of URLs for the successfully uploaded files.
		@description - This function handles the upload of multiple files to Cloudinary.
		It first checks if the file list is empty and sets the uploading state to false if so.
		Then, it sets the uploading state to true and initiates the upload process using the `batchUpload` function.
		After all uploads are completed, it returns the array of URLs for the uploaded files.
		If any upload fails, it catches the error, logs it to the console, and rethrows the error.
		Finally, it resets the uploading state to false to indicate that the upload process has ended.
	*/
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

	const updateProgress = (fileName: string, percent: number) => {
		setUploadProgress((prev) => ({
			...prev,
			[fileName]: percent
		}));
	};

	const handleImageSelect = (files: FileList) => {
		if (files.length < 1) return;
		// setSelectedImages(files);

		setValue('images', files, { shouldDirty: true });
	};
	const handleVideoSelect = (files: FileList) => {
		if (files.length < 1) return;

		// setSelectedVideo(files);
		setValue('videos', files);
	};

	/* @Param {File} file - The file to be removed from the preview.
		@description - This function handles the removal of a file from the preview section.
		It checks the type of the file (image or video) and updates the corresponding state (selectedImages or selectedVideo) by filtering out the removed file.
		If there are no remaining files after the removal, it sets the state to null.
	*/

	const onPreviewFileRemove = (file: File) => {
		if (file.type.startsWith('image/')) {
			setValue('images', null); // Clear the images field in the form
		} else {
			setValue('videos', null);
		}
	};

	// // Helper to create a FileList from an array of File objects
	// function FileListFromArray(files: File[]): FileList {
	// 	const dataTransfer = new DataTransfer();
	// 	files.forEach((file) => dataTransfer.items.add(file));
	// 	return dataTransfer.files;
	// }

	return (
		<div className='lg:w-2/3  flex flex-col gap-4'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className='flex bg-card flex-1 p-6 rounded-lg border items-center'>
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

					<Label
						text={'Specify Request Type'}
						name={'ticketType'}
						required={true}
					/>
					<Controller
						name='type'
						control={control}
						rules={{ required: 'Please select a ticket type' }}
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='py-3 h-fit'>
									<SelectValue placeholder='Select a ticket type' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Ticket Types</SelectLabel>
										{data?.map((type) => (
											<SelectItem
												key={type._id}
												value={type._id}>
												{type.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					<section className='w-full items-start flex-col mt-3 lg:flex-row flex gap-10'>
						<div className=' w-full lg:w-1/2  border   p-2 rounded-2xl'>
							<FileUpload
								id='image'
								label={'Upload Images'}
								onFileSelect={handleImageSelect}
								multiple={true}
								accept={'image/*'}
								icon={<IoIosCloudUpload />}
								onPreviewFileRemove={onPreviewFileRemove}
								uploadProgress={uploadProgress}
								initialFiles={initialImageFiles}
								onRemoveInitialFile={handleRemoveInitialAsset}
							/>
						</div>

						<div className='w-full lg:w-1/2 border   p-2 rounded-2xl'>
							<FileUpload
								id='video'
								label={'Upload Videos'}
								onFileSelect={handleVideoSelect}
								multiple={true}
								accept={'video/*'}
								icon={<RiVideoUploadLine />}
								onPreviewFileRemove={onPreviewFileRemove}
								uploadProgress={uploadProgress}
								initialFiles={initialVideoFiles}
								onRemoveInitialFile={handleRemoveInitialAsset}
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
							styles='rounded-lg'
							disabled={!isValid || isSubmitting || !isDirty}
							loading={isSubmitting}
							btnText={` ${
								isEditing ? 'Update' : 'Create'
							} Ticket`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default TicketForm;
