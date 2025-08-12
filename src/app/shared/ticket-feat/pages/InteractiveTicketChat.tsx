'use client';
import { useState, useRef, useEffect } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import {
	Send,
	Paperclip,
	Wrench,
	Bot,
	User,
	ImageIcon,
	X,
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	LoaderCircle
} from 'lucide-react';
import { ManageTicketForm } from '../model/ticket.model';
import { CreateTicketPayload } from '../../model/model';
import { useFormContext } from 'react-hook-form';
import { useFetchCategories, useFetchRequestTypes } from '../hooks/ticketHooks';
import { TICKET_PRIORITY } from '../../enums/enums';
import {
	batchUpload,
	formatMB,
	inferSingleType,
	MAX_DOC_SIZE,
	MAX_IMAGE_SIZE,
	MAX_VIDEO_SIZE,
	withinLimit
} from '../helpers/helpers';

interface ChatMessage {
	id: string;
	type: 'bot' | 'user';
	content: string;
	timestamp: Date;
	options?: string[];
	inputType?: 'text' | 'select' | 'textarea' | 'file';
	selectOptions?: { value: string; label: string }[];
	field?: string;
	selectedValue?: string;
}

interface RequestData {
	category?: string;
	priority?: string;
	area?: string;
	title?: string;
	description?: string;
	attachments?: File[];
	contactPreference?: string;
	availability?: string;
}

const PRIORITIES = [
	{ value: TICKET_PRIORITY.high, label: 'Emergency (Immediate)' },
	{ value: TICKET_PRIORITY.medium, label: 'Urgent (24 hours)' },
	{ value: TICKET_PRIORITY.low, label: 'Normal (3-5 days)' }
];

const LOCATIONS = [
	{ value: 'kitchen', label: 'Kitchen' },
	{ value: 'bathroom', label: 'Bathroom' },
	{ value: 'living_room', label: 'Living Room' },
	{ value: 'bedroom', label: 'Bedroom' },
	{ value: 'balcony', label: 'Balcony/Patio' },
	{ value: 'laundry', label: 'Laundry Room' },
	{ value: 'hallway', label: 'Hallway' },
	{ value: 'other', label: 'Other Location' }
];

interface InteractiveTicketChatProps {
	onSubmit: (
		data: CreateTicketPayload,
		actions: { onSuccess: () => void; onError: () => void }
	) => void;
	children: React.ReactNode;
}
export function InteractiveTicketChat({
	onSubmit,
	children
}: InteractiveTicketChatProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentInput, setCurrentInput] = useState('');
	const [requestData, setRequestData] = useState<RequestData>({});
	const [currentStep, setCurrentStep] = useState(0);
	const [isTyping, setIsTyping] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isListening, setIsListening] = useState(false);
	const [isSpeechSupported, setIsSpeechSupported] = useState(false);
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<
		Record<string, number>
	>({});
	const [uploadResults, setUploadResults] = useState<Record<string, string>>(
		{}
	);
	const { setValue, getValues, reset } = useFormContext<ManageTicketForm>();
	const [isEditing, setIsEditing] = useState(false);

	const { data: categories } = useFetchCategories();
	const { data: requestTypes } = useFetchRequestTypes();

	// Initialize speech recognition

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				setIsSpeechSupported(true);
				const recognition = new SpeechRecognition();
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.lang = 'en-US';

				recognition.onstart = () => {
					setIsListening(true);
				};

				recognition.onresult = (event) => {
					const transcript = event.results[0][0].transcript;
					setCurrentInput(transcript);
					setIsListening(false);
				};

				recognition.onerror = (event) => {
					console.error('Speech recognition error:', event.error);
					setIsListening(false);
				};

				recognition.onend = () => {
					setIsListening(false);
				};

				recognitionRef.current = recognition;
			}
		}
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && messages.length === 0) {
			startConversation();
		}
	}, [isOpen]);

	// Text-to-speech function with better voice selection
	const speakMessage = (text: string) => {
		if (!voiceEnabled || typeof window === 'undefined') return;

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 0.85; // Slightly slower for better clarity
		utterance.pitch = 1.1; // Slightly higher pitch for friendliness
		utterance.volume = 0.9;

		// Get available voices
		const voices = window.speechSynthesis.getVoices();

		// Priority order for natural voices
		const voicePreferences = [
			// Premium/Neural voices (most natural)
			'Microsoft Guy Online (Natural) - English (United States)',
			'Microsoft Aria Online (Natural) - English (United States)',
			'Microsoft Jenny Online (Natural) - English (United States)',
			'Google US English',
			'Google UK English Female',
			'Google UK English Male',

			// High-quality system voices
			'Samantha', // macOS
			'Alex', // macOS
			'Victoria', // macOS
			'Karen', // macOS
			'Microsoft Zira Desktop - English (United States)',
			'Microsoft David Desktop - English (United States)',
			'Microsoft Mark Desktop - English (United States)',

			// Fallback to any English voice
			'en-US',
			'en-GB',
			'en-AU',
			'en-CA'
		];

		// Find the best available voice
		let selectedVoice = null;

		// First, try to find exact matches
		for (const preference of voicePreferences) {
			selectedVoice = voices.find(
				(voice) =>
					voice.name === preference || voice.name.includes(preference)
			);
			if (selectedVoice) break;
		}

		// If no exact match, find by language and quality indicators
		if (!selectedVoice) {
			selectedVoice = voices.find(
				(voice) =>
					voice.lang.startsWith('en') &&
					(voice.name.toLowerCase().includes('neural') ||
						voice.name.toLowerCase().includes('natural') ||
						voice.name.toLowerCase().includes('premium') ||
						voice.name.toLowerCase().includes('enhanced'))
			);
		}

		// Fallback to any English voice with quality indicators
		if (!selectedVoice) {
			selectedVoice = voices.find(
				(voice) =>
					voice.lang.startsWith('en') &&
					(voice.name.toLowerCase().includes('google') ||
						voice.name.toLowerCase().includes('microsoft') ||
						voice.name.toLowerCase().includes('apple'))
			);
		}

		// Final fallback to any English voice
		if (!selectedVoice) {
			selectedVoice = voices.find((voice) => voice.lang.startsWith('en'));
		}

		if (selectedVoice) {
			utterance.voice = selectedVoice;
			console.log('Using voice:', selectedVoice.name); // For debugging
		}

		// Add some natural pauses for better speech flow
		const processedText = text
			.replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
			.replace(/\n\n/g, '. ') // Convert double line breaks to pauses
			.replace(/\n/g, ', ') // Convert single line breaks to short pauses
			.replace(/([.!?])\s+/g, '$1 '); // Ensure proper spacing after sentences

		utterance.text = processedText;

		window.speechSynthesis.speak(utterance);
	};

	const startVoiceRecognition = () => {
		if (recognitionRef.current && isSpeechSupported) {
			window.speechSynthesis.cancel();
			recognitionRef.current.start();
		}
	};

	const stopVoiceRecognition = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
		}
		setIsListening(false);
	};

	const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
		const inputFieldValue = message.field as string;
		const newMessage: ChatMessage = {
			...message,

			id: Date.now().toString(),
			timestamp: new Date()
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const addBotMessage = (content: string, options?: Partial<ChatMessage>) => {
		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			addMessage({
				type: 'bot',
				content,
				...options
			});
			// Speak the bot message
			if (voiceEnabled) {
				setTimeout(() => speakMessage(content), 500);
			}
		}, 1000);
	};

	const startConversation = () => {
		addBotMessage(
			"Hi! I'm here to help you submit a maintenance request. Let's start by identifying what type of request you'll like to submit.",
			{
				inputType: 'select',
				selectOptions: requestTypes,
				field: 'type'
			}
		);
	};

	const handleUserResponse = (
		value: string,
		field?: string,
		label?: string
	) => {
		// Add user message
		addMessage({
			type: 'user',
			content: label || value
		});

		const allowed: (keyof ManageTicketForm)[] = [
			'images',
			'videos',
			'documents'
		];
		// Update request data
		if (field) {
			if (!allowed.includes(field as keyof ManageTicketForm)) {
				setValue(field as keyof ManageTicketForm, value);
			}
			// setRequestData((prev) => ({ ...prev, [field]: value }));
		}

		// Determine next step based on current progress
		setTimeout(() => {
			isEditing
				? processNextStep('', 'availability')
				: processNextStep(value, field);
		}, 500);
	};

	const processNextStep = (value: string, field?: string) => {
		switch (field) {
			case 'type':
				addBotMessage(
					"Got it! Can you identify the issue you're experiencing? This helps us categorize your request appropriately.",
					{
						inputType: 'select',
						selectOptions: categories,
						field: 'category'
					}
				);
				break;
			case 'category':
				addBotMessage(
					'Got it! Now, how urgent is this issue? This helps us prioritize your request appropriately.',
					{
						inputType: 'select',
						selectOptions: PRIORITIES,
						field: 'priority'
					}
				);
				break;

			case 'priority':
				addBotMessage(
					'Thanks! Where in your apartment is this issue located?',
					{
						inputType: 'select',
						selectOptions: LOCATIONS,
						field: 'area'
					}
				);
				break;

			case 'area':
				addBotMessage(
					"Perfect! Now, could you give me a brief title for this maintenance request? For example: 'Kitchen faucet leaking' or 'Bedroom light not working'. You can type or use the microphone to speak your response.",
					{
						inputType: 'text',
						field: 'title'
					}
				);
				break;

			case 'title':
				addBotMessage(
					"Great! Now please provide a detailed description of the issue. Include any relevant details like when it started, what you've tried, or any other important information. Feel free to use voice input for longer descriptions.",
					{
						inputType: 'textarea',
						field: 'description'
					}
				);
				break;

			case 'description':
				addBotMessage(
					'Excellent! Would you like to add any photos or documents to help us understand the issue better? You can upload images, videos, or documents.',
					{
						inputType: 'file',
						field: 'attachments'
					}
				);
				break;

			case 'attachments':
			case 'images':
			case 'videos':
			case 'documents':
				showConfirmation();
				// addBotMessage(
				// 	'How would you prefer to be contacted about this request?',
				// 	{
				// 		inputType: 'select',
				// 		selectOptions: [
				// 			{ value: 'phone', label: 'Phone Call' },
				// 			{ value: 'text', label: 'Text Message' },
				// 			{ value: 'email', label: 'Email' },
				// 			{ value: 'app', label: 'In-App Messages Only' }
				// 		],
				// 		field: 'contactPreference'
				// 	}
				// );
				break;

			case 'contactPreference':
				if (
					requestData.priority === 'emergency' ||
					requestData.priority === 'urgent'
				) {
					addBotMessage(
						'Since this is an urgent request, when are you typically available for a technician to visit? You can speak your availability times.',
						{
							inputType: 'text',
							field: 'availability'
						}
					);
				} else {
					showSummary();
				}
				break;

			case 'availability':
				showSummary();
				break;

			default:
				value;
		}
	};
	const updateStep = (value: string, field?: string) => {
		switch (field) {
			case 'type':
				addBotMessage(
					"	Got it! Can you identify what type of request you'll like to submit.",
					{
						inputType: 'select',
						selectOptions: requestTypes,
						field: 'type'
					}
				);
				break;
			case 'category':
				addBotMessage(
					"Got it! Can you identify the issue you're experiencing? This helps us categorize your request appropriately.",
					{
						inputType: 'select',
						selectOptions: categories,
						field: 'category'
					}
				);
				break;
			case 'priority':
				addBotMessage(
					'Got it! Now, how urgent is this issue? This helps us prioritize your request appropriately.',
					{
						inputType: 'select',
						selectOptions: PRIORITIES,
						field: 'priority'
					}
				);
				break;

			case 'area':
				addBotMessage(
					'Thanks! Where in your apartment is this issue located?',
					{
						inputType: 'select',
						selectOptions: LOCATIONS,
						field: 'area'
					}
				);
				break;

			case 'title':
				addBotMessage(
					"Perfect! Now, could you give me a brief title for this maintenance request? For example: 'Kitchen faucet leaking' or 'Bedroom light not working'. You can type or use the microphone to speak your response.",
					{
						inputType: 'text',
						field: 'title'
					}
				);
				break;

			case 'description':
				addBotMessage(
					"Great! Now please provide a detailed description of the issue. Include any relevant details like when it started, what you've tried, or any other important information. Feel free to use voice input for longer descriptions.",
					{
						inputType: 'textarea',
						field: 'description'
					}
				);
				break;

			case 'attachment':
				addBotMessage(
					'Excellent! Would you like to add any photos or documents to help us understand the issue better? You can upload images, videos, or documents.',
					{
						inputType: 'file',
						field: 'attachments'
					}
				);
				break;

			case 'contactPreference':
				addBotMessage(
					'How would you prefer to be contacted about this request?',
					{
						inputType: 'select',
						selectOptions: [
							{ value: 'phone', label: 'Phone Call' },
							{ value: 'text', label: 'Text Message' },
							{ value: 'email', label: 'Email' },
							{ value: 'app', label: 'In-App Messages Only' }
						],
						field: 'contactPreference'
					}
				);
				break;

			case 'contactPreference':
				if (
					requestData.priority === 'emergency' ||
					requestData.priority === 'urgent'
				) {
					addBotMessage(
						'Since this is an urgent request, when are you typically available for a technician to visit? You can speak your availability times.',
						{
							inputType: 'text',
							field: 'availability'
						}
					);
				} else {
					showSummary();
				}
				break;

			case 'availability':
				showSummary();
				break;

			default:
				value;
		}
	};
	const showSummary = () => {
		const values = getValues();

		const categoryLabel = categories?.find(
			(c) => c.value === values.category
		)?.label;
		// const priorityLabel = PRIORITIES.find(
		// 	(p) => p.value === values.priority
		// )?.label;
		const locationLabel = LOCATIONS.find(
			(l) => l.value === values.area
		)?.label;

		const summary = `Perfect! Here's a summary of your maintenance request:

**Category:** ${categoryLabel}
**Location:** ${locationLabel}
**Title:** ${values.title}
**Description:** ${values.description}




Would you like to submit this request?`;

		addBotMessage(summary, {
			options: ['Submit Request', 'Make Changes']
		});
	};
	const showConfirmation = () => {
		const confirmationMessage = `Would you like to proceed with these attachments?`;

		addBotMessage(confirmationMessage, {
			options: ['Proceed', 'Add More Attachments', 'Remove All']
		});
	};

	const handleOptionClick = (option: string) => {
		addMessage({
			type: 'user',
			content: option
		});

		if (option === 'Submit Request') {
			submitRequest();
			return false;
		} else if (option === 'Make Changes') {
			addBotMessage(
				'No problem! What would you like to change? You can start over or tell me what needs to be updated.'
			);
			setIsEditing(true);
			showFields();
			return false;
		} else if (option === 'Remove All') {
			const types = [
				...new Set(selectedFiles.map((file) => inferSingleType([file])))
			] as (keyof ManageTicketForm)[];

			types.forEach((type) => {
				setValue(type, []);
			});

			setSelectedFiles([]);

			addBotMessage(
				'Great, All attachments have been removed. Would you like to add new ones?',
				{
					inputType: 'file',
					field: 'attachments'
				}
			);
		} else if (option === 'Add More Attachments') {
			addBotMessage(
				'Please upload any images, videos, or documents related to your request. You can select multiple files at once.',
				{
					inputType: 'file',
					field: 'attachments'
				}
			);
			return false;
		} else if (option === 'Proceed') {
			addBotMessage(
				'How would you prefer to be contacted about this request?',
				{
					inputType: 'select',
					selectOptions: [
						{ value: 'phone', label: 'Phone Call' },
						{ value: 'text', label: 'Text Message' },
						{ value: 'email', label: 'Email' },
						{ value: 'app', label: 'In-App Messages Only' }
					],
					field: 'contactPreference'
				}
			);
			return false;
		}

		updateStep(option, option);
	};

	function showFields() {
		const summary = 'Ok! Here are the existing fields, kindly select';
		addBotMessage(summary, {
			options: Object.keys(getValues())
		});
	}

	function BuildRequestPayload(
		data: ManageTicketForm,
		imgUrls?: string[],
		videoUrls?: string[],
		docUrls?: string[]
	): CreateTicketPayload {
		let images: string[] = [];
		let videos: string[] = [];
		let documents: string[] = [];

		images = imgUrls || [];
		videos = videoUrls || [];
		documents = docUrls || [];

		return {
			...data,
			images,
			videos,
			documents
		};
	}

	const updateProgress = (fileName: string, percent: number) => {
		setUploadProgress((prev) => ({
			...prev,
			[fileName]: percent
		}));
	};

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

	type MediaType = 'image' | 'video' | 'raw';

	async function handleMultipleUpload(
		files: File[] | null | undefined,
		type: MediaType,
		{
			cloudName,
			presets,
			cache
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
				axiosConfig: { timeout: 60_000 }
			});

			// Optional: surface failures without blocking successes
			const failed = Object.keys(errors);
			if (failed.length > 0) {
				console.warn('Some files failed to upload:', errors);
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

	const submitRequest = async () => {
		const { images, videos, documents } = getValues(); // Avoid multiple getValues() calls

		setIsLoading(true);
		const [imgUrls, videoUrls, docUrls] = await Promise.all([
			handleMultipleUpload(images, 'image', {
				cloudName: process.env.CLOUDINARY_NAME!,
				presets: {
					image: process.env.IMG_PRESET!,
					video: process.env.VIDEO_PRESET!, // unused in image branch
					raw: process.env.DOCUMENT_PRESET!
				},
				cache: uploadResults // optional; filename -> url map if you keep one
			}),
			handleMultipleUpload(videos, 'video', {
				cloudName: process.env.CLOUDINARY_NAME!,
				presets: {
					image: process.env.IMG_PRESET!,
					video: process.env.VIDEO_PRESET!,
					raw: process.env.DOCUMENT_PRESET! // unused in video branch
				},
				cache: uploadResults
			}),
			handleMultipleUpload(documents, 'raw', {
				cloudName: process.env.CLOUDINARY_NAME!,
				presets: {
					image: process.env.IMG_PRESET!,
					video: process.env.VIDEO_PRESET!,
					raw: process.env.DOCUMENT_PRESET!
				},
				cache: uploadResults
			})
		]);

		const payload = BuildRequestPayload(
			getValues(),
			imgUrls,
			videoUrls,
			docUrls
		);
		setIsLoading(true);
		onSubmit(payload, {
			onSuccess() {
				addBotMessage(
					'🎉 Your maintenance request has been submitted successfully! \n\n' +
						"You'll receive a confirmation email shortly, and our team will be in touch according to your preferred contact method. You can track the progress of your request in your dashboard."
				);
				setIsLoading(false);
				setTimeout(() => {
					reset();
					setMessages([]);
					setIsEditing(false);
					setRequestData({});
					setSelectedFiles([]);
					setCurrentStep(0);
					setIsOpen(false);
					window.speechSynthesis.cancel();
				}, 2000);
			},
			onError() {
				setIsLoading(false);
			}
		});

		// Reset for next use
	};

	// type ManageTicketForm = {
	// 	images: File[];
	// 	videos: File[];
	// 	documents: File[];
	// };

	// Example handleFileUpload at the input boundary:
	const handleFileUpload = (files: FileList | null) => {
		if (!files || files.length === 0) return;

		const target = inferSingleType(files); // 'images' | 'videos' | 'documents' | null
		if (!target) {
			handleUserResponse(
				'Please upload only images, only videos, or only documents in one selection.',
				'description'
			);
			fileInputRef.current && (fileInputRef.current.value = '');
			return;
		}

		const all = Array.from(files);
		const valid = all.filter((f) => withinLimit(f, target));
		const oversized = all.filter((f) => !withinLimit(f, target));

		if (oversized.length) {
			const limitText =
				target === 'images'
					? formatMB(MAX_IMAGE_SIZE)
					: target === 'videos'
						? formatMB(MAX_VIDEO_SIZE)
						: formatMB(MAX_DOC_SIZE);
			handleUserResponse(
				`Rejected ${oversized.length} ${target} due to size limit (${limitText} each): ${oversized.map((f) => f.name).join(', ')}`,
				target
			);
		}
		if (valid.length === 0) {
			fileInputRef.current && (fileInputRef.current.value = '');
			return;
		}

		const prev = getValues(target) ?? [];
		setValue(target, [...prev, ...valid], {
			shouldDirty: true,
			shouldValidate: true
		});

		setSelectedFiles((prev) => [...prev, ...valid]);

		handleUserResponse(
			`Added ${valid.length} ${target}: ${valid.map((f) => f.name).join(', ')}`,
			target
		);
		fileInputRef.current && (fileInputRef.current.value = '');
	};

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

		const type = inferSingleType(selectedFiles) as keyof ManageTicketForm;

		const currentFiles = (getValues(type) || []) as File[];
		const updatedFiles = currentFiles.filter((_, i) => i !== index);
		setValue(type, updatedFiles, {
			shouldDirty: true,
			shouldValidate: true
		});
		handleUserResponse(`Removed file: ${currentFiles[index].name}`, type);
		if (voiceEnabled) {
			speakMessage(`Removed file: ${currentFiles[index].name}`);
		}
	};

	const handleSendMessage = () => {
		if (!currentInput.trim()) return;

		const lastBotMessage = messages[messages.length - 1];
		if (lastBotMessage?.type === 'bot' && lastBotMessage.field) {
			handleUserResponse(currentInput, lastBotMessage.field);
		} else {
			handleUserResponse(currentInput);
		}

		setCurrentInput('');
	};

	const handleSelectChange = (value: string) => {
		const lastBotMessage = messages[messages.length - 1];
		if (lastBotMessage?.type === 'bot' && lastBotMessage.field) {
			const selectedOption = lastBotMessage.selectOptions?.find(
				(opt) => opt.value === value
			);
			handleUserResponse(
				value,
				lastBotMessage.field,
				selectedOption?.label
			);
		}
	};

	const formatTime = (timestamp: Date) => {
		return timestamp.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const resetChat = () => {
		reset();
		setMessages([]);
		setRequestData({});
		setSelectedFiles([]);
		setCurrentStep(0);
		setCurrentInput('');
		setIsEditing(false);
		// Stop any ongoing speech
		if (typeof window !== 'undefined') {
			window.speechSynthesis.cancel();
		}
		startConversation();
	};

	const toggleVoice = () => {
		setVoiceEnabled(!voiceEnabled);
		if (!voiceEnabled) {
			// Stop any ongoing speech when disabling
			if (typeof window !== 'undefined') {
				window.speechSynthesis.cancel();
			}
		}
	};

	// Add this useEffect after the existing speech recognition useEffect
	useEffect(() => {
		// Ensure voices are loaded (some browsers load them asynchronously)
		const loadVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				console.log(
					'Available voices:',
					voices.map((v) => `${v.name} (${v.lang})`)
				);
			}
		};

		if (typeof window !== 'undefined') {
			// Load voices immediately if available
			loadVoices();

			// Also listen for the voiceschanged event
			window.speechSynthesis.addEventListener(
				'voiceschanged',
				loadVoices
			);

			return () => {
				window.speechSynthesis.removeEventListener(
					'voiceschanged',
					loadVoices
				);
			};
		}
	}, []);

	const lastMessage = messages[messages.length - 1];
	const field = lastMessage?.field as keyof ManageTicketForm;

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent
				side='right'
				className='w-full   p-0 flex flex-col max-h-screen   max-w-[100vw] md:max-w-3/4'>
				{/* <SheetClose asChild>
					<Button
						variant='ghost'
						size='icon'
						className='absolute top-2 right-1 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'>
						<X className='w-6 h-6' />{' '}
					</Button>
				</SheetClose> */}
				<SheetHeader className='p-4 border-b border-gray-200 dark:border-gray-800'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
								<Wrench className='h-5 w-5 text-blue-600 dark:text-blue-400' />
							</div>
							<div>
								<SheetTitle className='text-lg font-semibold'>
									Maintenance Request
								</SheetTitle>
								<SheetDescription className='text-sm'>
									Chat with our assistant to submit your
									request
								</SheetDescription>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							{isSpeechSupported && (
								<Button
									variant='ghost'
									size='sm'
									onClick={toggleVoice}
									className={
										voiceEnabled
											? 'text-blue-600'
											: 'text-gray-400'
									}
									title={
										voiceEnabled
											? 'Voice enabled'
											: 'Voice disabled'
									}>
									{voiceEnabled ? (
										<Volume2 className='h-4 w-4' />
									) : (
										<VolumeX className='h-4 w-4' />
									)}
								</Button>
							)}
							<Button
								variant='ghost'
								size='sm'
								onClick={resetChat}>
								Reset
							</Button>
						</div>
					</div>
					{isSpeechSupported && (
						<div className='flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400'>
							<Mic className='h-3 w-3' />
							<span>
								Voice input available - click the microphone to
								speak
							</span>
						</div>
					)}
				</SheetHeader>

				{/* Messages */}
				<div className='flex-1 overflow-y-auto p-4 space-y-4'>
					{messages.map((message, ind) => (
						<div
							key={message.id + ind}
							className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div
								className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
								<Avatar className='h-8 w-8 flex-shrink-0'>
									<AvatarFallback
										className={
											message.type === 'bot'
												? 'bg-blue-100 text-blue-600'
												: 'bg-gray-100'
										}>
										{message.type === 'bot' ? (
											<Bot className='h-4 w-4' />
										) : (
											<User className='h-4 w-4' />
										)}
									</AvatarFallback>
								</Avatar>
								<div className='flex flex-col space-y-1'>
									<div
										className={`rounded-lg p-3 ${
											message.type === 'user'
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
										}`}>
										<p className='text-sm whitespace-pre-wrap'>
											{message.content}
										</p>
									</div>
									<span className='text-xs text-gray-500 dark:text-gray-400 px-1'>
										{formatTime(message.timestamp)}
									</span>

									{/* Options */}
									{message.options && (
										<div className='flex flex-wrap gap-2 mt-2'>
											{message.options.map((option) => (
												<Button
													key={option}
													variant='outline'
													size='sm'
													onClick={() =>
														handleOptionClick(
															option
														)
													}
													className='text-xs'>
													{option}
													{isLoading &&
														/submit/i.test(
															option
														) && (
															<LoaderCircle
																strokeWidth={1}
																size={18}
																className='ml-2 text-button-primary animate-spin'
															/>
														)}
												</Button>
											))}
										</div>
									)}

									{/* Select Input */}
									{message.inputType === 'select' &&
										message.selectOptions && (
											<div className='mt-2'>
												<Select
													defaultValue={getValues(
														message.field as keyof ManageTicketForm
													)?.toString()}
													onValueChange={
														handleSelectChange
													}>
													<SelectTrigger className='w-full'>
														<SelectValue placeholder='Choose an option...' />
													</SelectTrigger>
													<SelectContent>
														{message.selectOptions.map(
															(option) => (
																<SelectItem
																	key={
																		option.value
																	}
																	value={
																		option.value
																	}>
																	{
																		option.label
																	}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
										)}

									{/* File Input */}
									{message.inputType === 'file' && (
										<div className='mt-2 space-y-2'>
											<input
												type='file'
												title='file-upload'
												ref={fileInputRef}
												onChange={(e) =>
													handleFileUpload(
														e.target.files
													)
												}
												className='hidden'
												multiple
												accept='image/*,video/*,.pdf,.doc,.docx'
											/>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													fileInputRef.current?.click()
												}
												className='w-full'>
												<Paperclip className='h-4 w-4 mr-2' />
												Choose Files
											</Button>

											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													addBotMessage(
														'How would you prefer to be contacted about this request?',
														{
															inputType: 'select',
															selectOptions: [
																{
																	value: 'phone',
																	label: 'Phone Call'
																},
																{
																	value: 'text',
																	label: 'Text Message'
																},
																{
																	value: 'email',
																	label: 'Email'
																},
																{
																	value: 'app',
																	label: 'In-App Messages Only'
																}
															],
															field: 'contactPreference'
														}
													)
												}
												className='w-full'>
												Skip for now
											</Button>

											{selectedFiles.length > 0 && (
												<div className='space-y-1'>
													{selectedFiles.map(
														(file, index) => (
															<div
																key={index}
																className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs'>
																<div className='flex items-center space-x-2'>
																	<ImageIcon className='h-3 w-3' />
																	<span className='truncate'>
																		{
																			file.name
																		}
																	</span>
																</div>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		removeFile(
																			index
																		)
																	}
																	className='h-6 w-6 p-0'>
																	<X className='h-3 w-3' />
																</Button>
															</div>
														)
													)}
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					))}

					{/* Typing Indicator */}
					{isTyping && (
						<div className='flex justify-start'>
							<div className='flex space-x-2'>
								<Avatar className='h-8 w-8'>
									<AvatarFallback className='bg-blue-100 text-blue-600'>
										<Bot className='h-4 w-4' />
									</AvatarFallback>
								</Avatar>
								<div className='bg-gray-100 dark:bg-gray-800 rounded-lg p-3'>
									<div className='flex space-x-1'>
										<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
										<div
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{
												animationDelay: '0.1s'
											}}></div>
										<div
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{
												animationDelay: '0.2s'
											}}></div>
									</div>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className='border-t border-gray-200 dark:border-gray-800 p-4'>
					<div className='flex space-x-2'>
						{messages.length > 0 &&
						messages[messages.length - 1]?.inputType ===
							'textarea' ? (
							<Textarea
								value={
									currentInput || getValues(field)?.toString()
								}
								onChange={(e) => {
									const value = e.target.value;
									setValue(field, value);
									setCurrentInput(value);
								}}
								placeholder='Describe the issue in detail... (or use voice input)'
								className='flex-1 min-h-[80px] resize-none'
								onKeyDown={(e) => {
									if (e.key === 'Enter' && e.ctrlKey) {
										handleSendMessage();
									}
								}}
							/>
						) : (
							<Input
								value={currentInput}
								onChange={(e) => {
									const value = e.target.value;
									setCurrentInput(value);
								}}
								placeholder='Type your response... (or use voice)'
								className='flex-1'
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSendMessage();
									}
								}}
							/>
						)}

						{/* Voice Input Button */}
						{isSpeechSupported && (
							<Button
								variant='outline'
								size='sm'
								onClick={
									isListening
										? stopVoiceRecognition
										: startVoiceRecognition
								}
								disabled={!voiceEnabled}
								className={`flex-shrink-0 ${
									isListening
										? 'bg-red-100 text-red-600 border-red-300 dark:bg-red-900 dark:text-red-400'
										: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
								}`}
								title={
									isListening
										? 'Stop recording'
										: 'Start voice input'
								}>
								{isListening ? (
									<MicOff className='h-4 w-4 animate-pulse' />
								) : (
									<Mic className='h-4 w-4' />
								)}
							</Button>
						)}

						<Button
							onClick={handleSendMessage}
							disabled={!currentInput.trim()}
							className='bg-blue-600 hover:bg-blue-700 flex-shrink-0'>
							<Send className='h-4 w-4' />
						</Button>
					</div>

					<div className='flex items-center justify-between mt-2'>
						<div className='text-xs text-gray-500 dark:text-gray-400'>
							{messages.length > 0 &&
							messages[messages.length - 1]?.inputType ===
								'textarea'
								? 'Press Ctrl+Enter to send'
								: 'Press Enter to send'}
						</div>
						{isListening && (
							<div className='flex items-center space-x-1 text-xs text-red-600 dark:text-red-400'>
								<div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
								<span>Listening...</span>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
