"use client";
import React, { FC, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { fetchTicketCategory } from "../services/ticket-service";
import { ManageTicketForm, ManageTicketFormProps } from "../models/ticket.model";
import { useFetchTicketType } from "../hooks/ticketHooks";
import {
  Category,
  CreateTicketPayload,
  TicketType,
} from "@/shared/model/model";
import FileUpload from "@/shared/components/form-elements/File-Upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Paperclip,
  PlusCircle,
  Settings2,
  Video,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { batchUpload } from "../helpers/helpers";

const TicketForm: FC<ManageTicketFormProps> = ({ ticket, onSubmit }) => {
  const isEditing = !!ticket?.id;
  const [autoCompleteValue, setAutoCompleteValue] = useState<{
    category: Category;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<Record<string, string>>(
    {}
  );

  const [isLoading, setIsLoading] = useState(false);

  const initialImageFiles =
    isEditing && Array.isArray(ticket?.images)
      ? ticket.images.map((url) => ({
          url,
          type: "image/",
          id: url,
        }))
      : [];

  const initialVideoFiles =
    isEditing && Array.isArray(ticket?.videos)
      ? ticket.videos.map((url) => ({
          url,
          type: "video/",
          id: url,
        }))
      : [];
  const initialDocumentFiles =
    isEditing && Array.isArray(ticket?.documents)
      ? ticket.documents.map((url) => ({
          url,
          type: "application/pdf",
          id: url,
        }))
      : [];

  const [remainingImages, setRemainingImages] = useState(initialImageFiles);
  const [remainingVideos, setRemainingVideos] = useState(initialVideoFiles);
  const [remainingDocuments, setRemainingDocuments] =
    useState(initialDocumentFiles);

  const router = useRouter();
  const { data } = useFetchTicketType<TicketType>();

  //form controls
  // const { register, handleSubmit, control, setValue, formState, getValues } =
  // 	useForm<ManageTicketForm>({
  // 		mode: 'all',
  // 		defaultValues: isEditing
  // 			? {
  // 					title: ticket.title,
  // 					description: ticket.description,
  // 					area: ticket.area,
  // 					type: ticket.type,
  // 					category:
  // 						typeof ticket.category === 'object'
  // 							? ticket.category.id
  // 							: ticket.category,
  // 					images: undefined,
  // 					videos: undefined
  // 				}
  // 			: {}
  // 	});

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors, isValid, isDirty },
  } = useFormContext<ManageTicketForm>();
  // const { errors, isValid, isDirty } = formState;

  // Handle auto-complete values
  function handleAutoCompleteValues(values: any) {
    setAutoCompleteValue({ ...autoCompleteValue, ...values });
    if (values.category) setValue("category", values.category.id);
  }

  // Create ticket mutation
  // const { isCreating, handleCreateTicket } = useCreateTicket(
  // 	isEditing,
  // 	ticket?.id
  // );

  const isSubmitting = isUploading || isLoading;

  function getCloudinaryPublicId(url: string) {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return matches ? matches[1] : "";
  }

  const handleRemoveInitialAsset = async (
    file: { url: string },
    resourceType: "image" | "video"
  ) => {
    const publicId = getCloudinaryPublicId(file.url);

    try {
      await fetch("/api/cloudinary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, resourceType }),
      });

      const updateState = {
        image: setRemainingImages,
        video: setRemainingVideos,
      };

      const formFieldKey = {
        image: "images",
        video: "videos",
      } as const;

      // Remove from component state
      updateState[resourceType]((prev) =>
        prev.filter((f) => f.url !== file.url)
      );

      // Update form state
      const currentValue = getValues()[formFieldKey[resourceType]];
      const updated = currentValue
        ? Array.from(currentValue).filter((f: any) => f.url !== file.url)
        : [];

      const updatedFileList =
        updated.length > 0 && updated[0] instanceof File ? updated : null;

      setValue(formFieldKey[resourceType], updatedFileList, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
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

  // async function formSubmit(data: ManageTicketForm) {
  // 	console.log('Submitting form:', data);
  // 	    const [imgUrls, videoUrls] = await Promise.all([
  // 			handleMultipleUpload(images, 'image', {
  // 				cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_NAME!,
  // 				presets: {
  // 					image: process.env.NEXT_PUBLIC_UPLOAD_IMAGE_PRESET!,
  // 					video: process.env.NEXT_PUBLIC_UPLOAD_VIDEO_PRESET! // unused in image branch
  // 				},
  // 				cache: uploadResults // optional; filename -> url map if you keep one
  // 			}),
  // 			handleMultipleUpload(videos, 'video', {
  // 				cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_NAME!,
  // 				presets: {
  // 					image: process.env.NEXT_PUBLIC_UPLOAD_IMAGE_PRESET!, // unused in video branch
  // 					video: process.env.NEXT_PUBLIC_UPLOAD_VIDEO_PRESET!
  // 				},
  // 				cache: uploadResults
  // 			})
  // 		]);

  // 	const payload = BuildRequestPayload(data, imgUrls, videoUrls);

  // 	setIsLoading(true);
  // 	onSubmit(payload, {
  // 		onSuccess() {
  // 			setIsLoading(false);
  // 		},
  // 		onError() {
  // 			setIsLoading(false);
  // 		}
  // 	});
  // 	// handleCreateTicket(payload, {
  // 	// 	onSuccess: () => {
  // 	// 		router.push(ROUTES_DEFINITION.DASHBOARD.TICKETS);
  // 	// 	}
  // 	// });
  // }

  async function formSubmit(data: ManageTicketForm) {
    try {
      const { images, videos, documents } = getValues(); // Avoid multiple getValues() calls

      setIsLoading(true);

      const [imgUrls, videoUrls] = await Promise.all([
        handleMultipleUpload(images, "image", {
          cloudName: process.env.CLOUDINARY_NAME!,
          presets: {
            image: process.env.IMG_PRESET!,
            video: process.env.VIDEO_PRESET!, // unused in image branch
            raw: process.env.DOCUMENT_PRESET!,
          },
          cache: uploadResults, // optional; filename -> url map if you keep one
        }),
        handleMultipleUpload(videos, "video", {
          cloudName: process.env.CLOUDINARY_NAME!,
          presets: {
            image: process.env.IMG_PRESET!,
            video: process.env.VIDEO_PRESET!,
            raw: process.env.DOCUMENT_PRESET!,
          },
          cache: uploadResults,
        }),
        handleMultipleUpload(documents, "raw", {
          cloudName: process.env.CLOUDINARY_NAME!,
          presets: {
            image: process.env.IMG_PRESET!,
            video: process.env.VIDEO_PRESET!,
            raw: process.env.DOCUMENT_PRESET!,
          },
          cache: uploadResults,
        }),
      ]);

      const payload = BuildRequestPayload(data, imgUrls, videoUrls);

      onSubmit(payload, {
        onSuccess() {
          setIsLoading(false);
        },
        onError() {
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error("Submit failed:", err);
      setIsLoading(false);
    }
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
    let documents: string[] = [];

    if (isEditing) {
      const existingImages = remainingImages.map((f) => f.url);
      const existingVideos = remainingVideos.map((f) => f.url);
      const existingDocuments = remainingDocuments.map((f) => f.url);
      images = [...existingImages, ...(imgUrls || [])];
      videos = [...existingVideos, ...(videoUrls || [])];
      documents = [...existingDocuments, ...(documents || [])];
    } else {
      images = imgUrls || [];
      videos = videoUrls || [];
    }

    return {
      ...data,
      images,
      videos,
      documents,
      ...(isEditing && {
        status: ticket?.status,
      }),
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

  //   function batchUpload(
  // 		fileList: FileList,
  // 		type: 'video' | 'image',
  // 		setProgress?: (fileName: string, percent: number) => void
  // 	) {
  // 		return Array.from(fileList).map(async (file) => {
  // 			// ✅ Check if already uploaded
  // 			if (uploadResults[file.name]) {
  // 				return uploadResults[file.name]; // reuse cached result
  // 			}

  // 			const formData = new FormData();
  // 			formData.append(
  // 				'upload_preset',
  // 				type === 'image'
  // 					? process.env.IMG_PRESET!
  // 					: process.env.VIDEO_PRESET!
  // 			);
  // 			formData.append('file', file);

  // 			try {
  // 				const response = await http.post(
  // 					`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/${type}/upload`,
  // 					formData,
  // 					{
  // 						onUploadProgress: (event) => {
  // 							const percent = Math.round(
  // 								(event.loaded * 100) / (event.total ?? 1)
  // 							);
  // 							if (setProgress) setProgress(file.name, percent);
  // 						}
  // 					}
  // 				);
  // 				const url = response.data.secure_url || response.data.url;

  // 				setUploadResults((prev) => ({ ...prev, [file.name]: url }));

  // 				return url;
  // 			} catch (error) {
  // 				console.error('Upload error:', error);
  // 				throw error;
  // 			}
  // 		});
  // 	}

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
  // 			const response = await http.post('/api/cloudinary', formData, {
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
  // async function handleMultipleUpload(
  // 	file: FileList,
  // 	type: 'video' | 'image'
  // ) {
  // 	if (!file) return;
  // 	setIsUploading(true);
  // 	const uploadPromises = await  batchUpload(file, type, updateProgress);
  // 	try {
  // 		const urls = await Promise.all(uploadPromises);
  // 		return urls;
  // 	} catch (error) {
  // 		console.error('Error uploading one or more files:', error);
  // 		throw error;
  // 	} finally {
  // 		setIsUploading(false); // upload ended
  // 	}
  // }

  // async function handleMultipleUpload(
  // 	fileList: FileList | null | undefined,
  // 	type: 'image' | 'video',
  // 	{
  // 		cloudName,
  // 		presets,
  // 		cache
  // 	}: {
  // 		cloudName: string;
  // 		presets: { image: string; video: string };
  // 		cache?: Record<string, string>;
  // 	}
  // ): Promise<string[]> {
  // 	if (!fileList || fileList.length === 0) return [];

  // 	setIsUploading(true);
  // 	try {
  // 		const { urls, errors } = await batchUpload(fileList, type, {
  // 			cloudName,
  // 			presets,
  // 			cache,
  // 			onProgress: updateProgress, // (fileName, percent) => void
  // 			axiosConfig: { timeout: 60_000 }
  // 		});

  // 		// Surface any failures (non-blocking for successful ones)
  // 		const failed = Object.keys(errors);
  // 		if (failed.length > 0) {
  // 			console.warn('Some files failed to upload:', errors);
  // 			// Optionally: show a toast/snackbar here
  // 			// showToast(`Failed to upload: ${failed.join(', ')}`);
  // 		}

  // 		// Return URLs in the SAME order as the incoming FileList
  // 		return Array.from(fileList)
  // 			.map((f) => urls[f.name])
  // 			.filter((u): u is string => Boolean(u));
  // 	} finally {
  // 		setIsUploading(false);
  // 	}
  // }

  type MediaType = "image" | "video" | "raw";

  async function handleMultipleUpload(
    files: File[] | null | undefined,
    type: MediaType,
    {
      cloudName,
      presets,
      cache,
    }: {
      cloudName: string;
      presets: { image: string; video: string; raw: string };
      cache?: Record<string, string>;
    }
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    setIsUploading(true);
    try {
      const { urls, errors } = await batchUpload(files, type, {
        cloudName,
        presets,
        cache,
        onProgress: updateProgress, // (fileName, percent) => void
        axiosConfig: { timeout: 60_000 },
      });

      // Optional: surface failures without blocking successes
      const failed = Object.keys(errors);
      if (failed.length > 0) {
        console.warn("Some files failed to upload:", errors);
        // e.g., toast(`Failed: ${failed.join(', ')}`);
      }

      // Preserve the order of the incoming File[]
      return files
        .map((f) => urls[f.name])
        .filter((u): u is string => Boolean(u));
    } finally {
      setIsUploading(false);
    }
  }

  const updateProgress = (fileName: string, percent: number) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fileName]: percent,
    }));
  };

  const handleImageSelect = (files: FileList) => {
    if (files.length < 1) return;
    setValue("images", Array.from(files), { shouldDirty: true });
  };
  const handleVideoSelect = (files: FileList) => {
    if (files.length < 1) return;
    setValue("videos", Array.from(files), { shouldDirty: true });
  };

  const onPreviewFileRemove = (file: File) => {
    if (file.type.startsWith("image/")) {
      setValue("images", null); // Clear the images field in the form
    } else {
      setValue("videos", null);
    }
  };

  const watchedType = watch("type");
  const selectedTypeName = data?.find((t) => t.id === watchedType)?.name;

  return (
    <form
      onSubmit={handleSubmit(formSubmit, onError)}
      className="w-full"
      noValidate
    >
      <div className="space-y-5">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="px-6 pb-2 pt-5">
              <SectionHeader
                step={1}
                icon={<FileText className="h-4 w-4" />}
                title="Ticket Details"
                subtitle="Provide a clear title and description of the issue"
              />
            </CardHeader>
            <Separator className="mx-6 w-auto" />
            <CardContent className="space-y-5 px-6 pb-6 pt-5">
              <div className="space-y-1.5">
                <Label htmlFor="title" required>
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Leaking faucet in master bathroom"
                  disabled={isSubmitting}
                  aria-invalid={!!errors?.title}
                  className="h-10 rounded-xl"
                  {...register("title", {
                    required: "This field is required",
                  })}
                />
                {errors?.title?.message ? (
                  <ErrorMessage errorMsg={errors.title.message.toString()} />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" required>
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the issue in detail — when it started, severity, hazards…"
                  disabled={isSubmitting}
                  aria-invalid={!!errors?.description}
                  className="rounded-xl"
                  {...register("description", {
                    required: "This field is required",
                  })}
                />
                {errors?.description?.message ? (
                  <ErrorMessage
                    errorMsg={errors.description.message.toString()}
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-combobox" required>
                  Category
                </Label>
                <CategoryCombobox
                  value={getValues("category")}
                  initialCategory={
                    typeof ticket?.category === "object"
                      ? (ticket?.category as Category)
                      : undefined
                  }
                  disabled={isSubmitting}
                  onChange={(cat) => {
                    handleAutoCompleteValues({ category: cat });
                  }}
                />
                {/* Autocomplete usage with static data */}
                {/* <AutoComplete<Category>
							queryKey='category'
							// service={fetchTicketCategory}
							label={'Category'}
							optionKey={'id'}
							// custom={'regularPrice'}
							displayValue={'name'}
							initialValue={ticket?.category}
							handler={handleAutoCompleteValues}
							staticData={[
								{
									id: '2222y2y22',
									id: '2222y2y22',
									name: 'Electrical',
									description:
										'Issues related to electrical wiring, lighting, and power outlets.'
								},
								{
									id: '2222y2y223',
									id: '2222y2y223',

									name: 'Plumbing',
									description:
										'Problems with water supply, drainage, leaks, and pipes.'
								},
								{
									id: '2222y2y228',
									id: '2222y2y228',
									name: 'HVAC',
									description:
										'Heating, ventilation, and air conditioning system repairs.'
								},
								{
									id: '2222y2y2290',
									id: '2222y2y2290',

									name: 'Carpentry',
									description:
										'Woodwork repairs, doors, windows, and furniture.'
								},
								{
									id: '2222y2y22qw',
									id: '2222y2y22qw',
									name: 'Appliance',
									description:
										'Repairs for household or office appliances.'
								},
								{
									id: '2222y2y22op',
									id: '2222y2y22op',
									name: 'Painting',
									description:
										'Wall, ceiling, or surface painting and touch-ups.'
								},
								{
									id: '2222y242',
									id: '2222y242',
									name: 'Pest Control',
									description:
										'Issues with insects, rodents, or other pests.'
								},
								{
									id: '2239222',
									id: '2239222',
									name: 'General Maintenance',
									description:
										'Other maintenance requests not covered by specific categories.'
								}
							]}
						/> */}

                <input
                  title="category"
                  type="hidden"
                  id="category"
                  {...register("category", {
                    required: "This field is required",
                  })}
                />
                {errors?.category?.message ? (
                  <ErrorMessage
                    errorMsg={errors.category.message.toString()}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="px-6 pb-2 pt-5">
              <SectionHeader
                step={2}
                icon={<MapPin className="h-4 w-4" />}
                title="Location & Type"
                subtitle="Where the issue is and what kind of service is needed"
              />
            </CardHeader>
            <Separator className="mx-6 w-auto" />
            <CardContent className="px-6 pb-6 pt-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="area" required>
                    Area
                  </Label>
                  <InputGroup className="h-10 rounded-xl">
                    <InputGroupAddon align="inline-start">
                      <MapPin className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="area"
                      type="text"
                      placeholder="e.g. Kitchen, Bedroom 2…"
                      disabled={isSubmitting}
                      aria-invalid={!!errors?.area}
                      {...register("area", {
                        required: "This field is required",
                      })}
                    />
                  </InputGroup>
                  {errors?.area?.message ? (
                    <ErrorMessage errorMsg={errors.area.message.toString()} />
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticketType" required>
                    Request Type
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Please select a ticket type" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Select a ticket type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Ticket Types</SelectLabel>
                            {data?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors?.type?.message ? (
                    <ErrorMessage errorMsg={errors.type.message.toString()} />
                  ) : null}
                </div>
              </div>

              {selectedTypeName && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Settings2 className="h-3 w-3" />
                    {selectedTypeName} request — a technician will be assigned
                    after review
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="px-6 pb-2 pt-5">
              <SectionHeader
                step={3}
                icon={<Paperclip className="h-4 w-4" />}
                title="Attachments"
                subtitle="Photos, videos, or documents that help describe the issue"
              />
            </CardHeader>
            <Separator className="mx-6 w-auto" />
            <CardContent className="space-y-6 px-6 pb-6 pt-5">
              <FileUpload
                id="image"
                label={"Images"}
                hint="PNG, JPG, WEBP up to 10 MB each"
                onFileSelect={handleImageSelect}
                multiple={true}
                accept={"image/*"}
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                onPreviewFileRemove={onPreviewFileRemove}
                uploadProgress={uploadProgress}
                initialFiles={initialImageFiles}
                onRemoveInitialFile={handleRemoveInitialAsset}
              />
              <Separator />
              <FileUpload
                id="video"
                label={"Videos"}
                hint="MP4, MOV up to 50 MB each"
                onFileSelect={handleVideoSelect}
                multiple={true}
                accept={"video/*"}
                icon={<Video className="h-3.5 w-3.5" />}
                onPreviewFileRemove={onPreviewFileRemove}
                uploadProgress={uploadProgress}
                initialFiles={initialVideoFiles}
                onRemoveInitialFile={handleRemoveInitialAsset}
              />
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-1 pb-2">
            <div className="rounded-2xl border bg-card/95 px-5 py-4 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Fields marked{" "}
                  <span className="font-medium text-destructive">*</span> are
                  required before submitting.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={isSubmitting}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl px-6"
                    disabled={!isValid || isSubmitting || !isDirty}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 size-4" />
                        {isEditing ? "Update" : "Create"} Ticket
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </form>
  );
};

function SectionHeader({
  icon,
  title,
  subtitle,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  step: number;
}) {
  return (
    <div className="mb-2 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {step}
          </span>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function CategoryCombobox({
  value,
  initialCategory,
  onChange,
  disabled,
}: {
  value?: string;
  initialCategory?: Category;
  onChange: (category: Category) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Category | undefined>(
    initialCategory
  );

  const { data, isLoading } = useQuery({
    queryKey: ["category", search],
    queryFn: () => fetchTicketCategory<Category>(search || null),
  });

  const categories = (data?.data || []) as Category[];
  const display =
    selected?.name ||
    categories.find((c) => c.id === value)?.name ||
    "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="category-combobox"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 w-full justify-between rounded-xl font-normal"
        >
          <span className={cn(!display && "text-muted-foreground")}>
            {display || "Select a category…"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : (
              <>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.id}
                      onSelect={() => {
                        setSelected(cat);
                        onChange(cat);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          (selected?.id || value) === cat.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default TicketForm;
