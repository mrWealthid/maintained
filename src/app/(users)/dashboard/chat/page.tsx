'use client';
import { useState, useRef, useEffect } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	Send,
	Paperclip,
	MoreVertical,
	UserPlus,
	Phone,
	Video,
	Info,
	Clock,
	CheckCircle,
	AlertCircle,
	Wrench,
	ArrowLeft,
	ImageIcon,
	File,
	Download
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/Theme-Toggle';

// Mock data
const mockRequest = {
	id: 'REQ-001',
	title: 'Kitchen Faucet Leak',
	description:
		'The kitchen faucet has been leaking for 2 days. Water is dripping constantly.',
	status: 'in_progress',
	priority: 'high',
	category: 'Plumbing',
	tenant: {
		id: 'tenant-1',
		name: 'Sarah Johnson',
		email: 'sarah.johnson@email.com',
		apartment: 'Apt 4B',
		phone: '+1 (555) 123-4567',
		avatar: '/placeholder.svg?height=40&width=40&text=SJ'
	},
	assignedTechnician: {
		id: 'tech-1',
		name: 'Mike Rodriguez',
		email: 'mike.rodriguez@maintenance.com',
		specialty: 'Plumbing',
		phone: '+1 (555) 987-6543',
		avatar: '/placeholder.svg?height=40&width=40&text=MR'
	},
	createdAt: '2024-01-15T10:30:00Z',
	updatedAt: '2024-01-15T14:20:00Z'
};

const mockMessages = [
	{
		id: 'msg-1',
		senderId: 'tenant-1',
		senderName: 'Sarah Johnson',
		senderRole: 'tenant',
		content:
			"Hi, I submitted a maintenance request for my kitchen faucet. It's been leaking for 2 days now and it's getting worse.",
		timestamp: '2024-01-15T10:30:00Z',
		attachments: [
			{
				id: 'att-1',
				name: 'faucet-leak.jpg',
				type: 'image',
				url: '/placeholder.svg?height=200&width=300&text=Faucet+Leak',
				size: '2.3 MB'
			}
		]
	},
	{
		id: 'msg-2',
		senderId: 'admin-1',
		senderName: 'Admin Support',
		senderRole: 'admin',
		content:
			"Thank you for reporting this issue, Sarah. I've received your request and I'm assigning a plumber to handle this. You should expect someone within 24 hours.",
		timestamp: '2024-01-15T11:15:00Z',
		attachments: []
	},
	{
		id: 'msg-3',
		senderId: 'admin-1',
		senderName: 'Admin Support',
		senderRole: 'admin',
		content:
			"I've assigned Mike Rodriguez, our certified plumber, to your case. He'll be in touch shortly to schedule a visit.",
		timestamp: '2024-01-15T11:16:00Z',
		attachments: []
	},
	{
		id: 'msg-4',
		senderId: 'tech-1',
		senderName: 'Mike Rodriguez',
		senderRole: 'technician',
		content:
			"Hi Sarah! I'm Mike, your assigned plumber. I can come by tomorrow between 2-4 PM to fix your faucet. Does that work for you?",
		timestamp: '2024-01-15T12:30:00Z',
		attachments: []
	},
	{
		id: 'msg-5',
		senderId: 'tenant-1',
		senderName: 'Sarah Johnson',
		senderRole: 'tenant',
		content:
			"That works perfectly! I'll be home during that time. Thank you for the quick response.",
		timestamp: '2024-01-15T13:45:00Z',
		attachments: []
	},
	{
		id: 'msg-6',
		senderId: 'tech-1',
		senderName: 'Mike Rodriguez',
		senderRole: 'technician',
		content:
			"Great! I'm on my way now. I have all the necessary parts. This should be a quick fix.",
		timestamp: '2024-01-15T14:20:00Z',
		attachments: []
	}
];

const mockTechnicians = [
	{
		id: 'tech-1',
		name: 'Mike Rodriguez',
		specialty: 'Plumbing',
		avatar: '/placeholder.svg?height=40&width=40&text=MR'
	},
	{
		id: 'tech-2',
		name: 'Lisa Chen',
		specialty: 'Electrical',
		avatar: '/placeholder.svg?height=40&width=40&text=LC'
	},
	{
		id: 'tech-3',
		name: 'David Wilson',
		specialty: 'HVAC',
		avatar: '/placeholder.svg?height=40&width=40&text=DW'
	}
];

export default function ChatPage() {
	const [messages, setMessages] = useState(mockMessages);
	const [newMessage, setNewMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [selectedTechnician, setSelectedTechnician] = useState('');
	const [showAddTechnician, setShowAddTechnician] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = () => {
		if (!newMessage.trim()) return;

		const message = {
			id: `msg-${Date.now()}`,
			senderId: 'admin-1',
			senderName: 'Admin Support',
			senderRole: 'admin' as const,
			content: newMessage,
			timestamp: new Date().toISOString(),
			attachments: []
		};

		setMessages([...messages, message]);
		setNewMessage('');
	};

	const handleAddTechnician = () => {
		if (!selectedTechnician) return;

		const technician = mockTechnicians.find(
			(t) => t.id === selectedTechnician
		);
		if (!technician) return;

		const message = {
			id: `msg-${Date.now()}`,
			senderId: 'admin-1',
			senderName: 'Admin Support',
			senderRole: 'admin' as const,
			content: `${technician.name} (${technician.specialty}) has been added to this conversation.`,
			timestamp: new Date().toISOString(),
			attachments: []
		};

		setMessages([...messages, message]);
		setSelectedTechnician('');
		setShowAddTechnician(false);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		// Handle file upload logic here
		console.log('Files selected:', files);
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'tenant':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'technician':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'open':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'in_progress':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatDate = (timestamp: string) => {
		return new Date(timestamp).toLocaleDateString([], {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	return (
		<div className='flex flex-col h-screen bg-gray-50 dark:bg-gray-950'>
			{/* Header */}
			<header className='border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<Link href='/dashboard'>
							<Button variant='ghost' size='sm'>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back
							</Button>
						</Link>
						<div className='flex items-center space-x-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
								<Wrench className='h-5 w-5 text-blue-600 dark:text-blue-400' />
							</div>
							<div>
								<h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
									{mockRequest.title}
								</h1>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									{mockRequest.id} •{' '}
									{mockRequest.tenant.apartment}
								</p>
							</div>
						</div>
					</div>
					<div className='flex items-center space-x-2'>
						<Badge className={getStatusColor(mockRequest.status)}>
							{mockRequest.status.replace('_', ' ')}
						</Badge>
						<ThemeToggle />
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='sm'>
									<MoreVertical className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem>
									<Info className='h-4 w-4 mr-2' />
									Request Details
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Phone className='h-4 w-4 mr-2' />
									Call Tenant
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Video className='h-4 w-4 mr-2' />
									Video Call
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<div className='flex flex-1 overflow-hidden'>
				{/* Chat Area */}
				<div className='flex-1 flex flex-col'>
					{/* Request Info Bar */}
					<div className='border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-4'>
								<div className='flex items-center space-x-2'>
									<Clock className='h-4 w-4 text-gray-500' />
									<span className='text-sm text-gray-600 dark:text-gray-400'>
										Created{' '}
										{formatDate(mockRequest.createdAt)}
									</span>
								</div>
								<div className='flex items-center space-x-2'>
									<AlertCircle className='h-4 w-4 text-orange-500' />
									<span className='text-sm font-medium text-orange-600 dark:text-orange-400'>
										{mockRequest.priority} priority
									</span>
								</div>
								<Badge variant='outline' className='text-xs'>
									{mockRequest.category}
								</Badge>
							</div>
							<Dialog
								open={showAddTechnician}
								onOpenChange={setShowAddTechnician}>
								<DialogTrigger asChild>
									<Button variant='outline' size='sm'>
										<UserPlus className='h-4 w-4 mr-2' />
										Add Technician
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											Add Technician to Chat
										</DialogTitle>
										<DialogDescription>
											Select a technician to add to this
											maintenance request conversation.
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<Select
											value={selectedTechnician}
											onValueChange={
												setSelectedTechnician
											}>
											<SelectTrigger>
												<SelectValue placeholder='Select a technician' />
											</SelectTrigger>
											<SelectContent>
												{mockTechnicians.map((tech) => (
													<SelectItem
														key={tech.id}
														value={tech.id}>
														<div className='flex items-center space-x-2'>
															<Avatar className='h-6 w-6'>
																<AvatarImage
																	src={
																		tech.avatar ||
																		'/placeholder.svg'
																	}
																/>
																<AvatarFallback>
																	{tech.name
																		.split(
																			' '
																		)
																		.map(
																			(
																				n
																			) =>
																				n[0]
																		)
																		.join(
																			''
																		)}
																</AvatarFallback>
															</Avatar>
															<div>
																<span className='font-medium'>
																	{tech.name}
																</span>
																<span className='text-sm text-gray-500 ml-2'>
																	(
																	{
																		tech.specialty
																	}
																	)
																</span>
															</div>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<div className='flex justify-end space-x-2'>
											<Button
												variant='outline'
												onClick={() =>
													setShowAddTechnician(false)
												}>
												Cancel
											</Button>
											<Button
												onClick={handleAddTechnician}
												disabled={!selectedTechnician}>
												Add to Chat
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Messages */}
					<div className='flex-1 overflow-y-auto p-4 space-y-4'>
						{messages.map((message) => (
							<div key={message.id} className='flex space-x-3'>
								<Avatar className='h-8 w-8 flex-shrink-0'>
									<AvatarImage
										src={`/placeholder-icon.png?height=32&width=32&text=${message.senderName
											.split(' ')
											.map((n) => n[0])
											.join('')}`}
									/>
									<AvatarFallback>
										{message.senderName
											.split(' ')
											.map((n) => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center space-x-2 mb-1'>
										<span className='text-sm font-medium text-gray-900 dark:text-white'>
											{message.senderName}
										</span>
										<Badge
											className={`text-xs ${getRoleColor(message.senderRole)}`}>
											{message.senderRole}
										</Badge>
										<span className='text-xs text-gray-500 dark:text-gray-400'>
											{formatTime(message.timestamp)}
										</span>
									</div>
									<div className='bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700'>
										<p className='text-sm text-gray-900 dark:text-white leading-relaxed'>
											{message.content}
										</p>
										{message.attachments.length > 0 && (
											<div className='mt-3 space-y-2'>
												{message.attachments.map(
													(attachment) => (
														<div
															key={attachment.id}
															className='flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border'>
															{attachment.type ===
															'image' ? (
																<ImageIcon className='h-4 w-4 text-blue-600' />
															) : (
																<File className='h-4 w-4 text-gray-600' />
															)}
															<span className='text-sm text-gray-700 dark:text-gray-300 flex-1'>
																{
																	attachment.name
																}
															</span>
															<span className='text-xs text-gray-500'>
																{
																	attachment.size
																}
															</span>
															<Button
																variant='ghost'
																size='sm'>
																<Download className='h-3 w-3' />
															</Button>
														</div>
													)
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
						{isTyping && (
							<div className='flex space-x-3'>
								<Avatar className='h-8 w-8'>
									<AvatarFallback>...</AvatarFallback>
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
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Message Input */}
					<div className='border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4'>
						<div className='flex space-x-2'>
							<input
								title='Upload files'
								type='file'
								ref={fileInputRef}
								onChange={handleFileUpload}
								className='hidden'
								multiple
								accept='image/*,.pdf,.doc,.docx'
							/>
							<Button
								variant='outline'
								size='sm'
								onClick={() => fileInputRef.current?.click()}
								className='flex-shrink-0'>
								<Paperclip className='h-4 w-4' />
							</Button>
							<Textarea
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder='Type your message...'
								className='flex-1 min-h-[40px] max-h-32 resize-none'
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
							/>
							<Button
								onClick={handleSendMessage}
								disabled={!newMessage.trim()}
								className='flex-shrink-0 bg-blue-600 hover:bg-blue-700'>
								<Send className='h-4 w-4' />
							</Button>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className='w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto'>
					<div className='p-4 space-y-6'>
						{/* Participants */}
						<div>
							<h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-3'>
								Participants ({3})
							</h3>
							<div className='space-y-3'>
								{/* Tenant */}
								<div className='flex items-center space-x-3'>
									<Avatar className='h-10 w-10'>
										<AvatarImage
											src={
												mockRequest.tenant.avatar ||
												'/placeholder.svg'
											}
										/>
										<AvatarFallback>SJ</AvatarFallback>
									</Avatar>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-gray-900 dark:text-white'>
											{mockRequest.tenant.name}
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											Tenant •{' '}
											{mockRequest.tenant.apartment}
										</p>
									</div>
									<Badge className={getRoleColor('tenant')}>
										Tenant
									</Badge>
								</div>

								{/* Admin */}
								<div className='flex items-center space-x-3'>
									<Avatar className='h-10 w-10'>
										<AvatarImage src='/placeholder.svg?height=40&width=40&text=AS' />
										<AvatarFallback>AS</AvatarFallback>
									</Avatar>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-gray-900 dark:text-white'>
											Admin Support
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											Property Manager
										</p>
									</div>
									<Badge className={getRoleColor('admin')}>
										Admin
									</Badge>
								</div>

								{/* Technician */}
								<div className='flex items-center space-x-3'>
									<Avatar className='h-10 w-10'>
										<AvatarImage
											src={
												mockRequest.assignedTechnician
													.avatar ||
												'/placeholder.svg'
											}
										/>
										<AvatarFallback>MR</AvatarFallback>
									</Avatar>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-gray-900 dark:text-white'>
											{
												mockRequest.assignedTechnician
													.name
											}
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											{
												mockRequest.assignedTechnician
													.specialty
											}
										</p>
									</div>
									<Badge
										className={getRoleColor('technician')}>
										Tech
									</Badge>
								</div>
							</div>
						</div>

						{/* Request Details */}
						<div>
							<h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-3'>
								Request Details
							</h3>
							<Card>
								<CardContent className='p-4 space-y-3'>
									<div>
										<label className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
											Description
										</label>
										<p className='text-sm text-gray-900 dark:text-white mt-1'>
											{mockRequest.description}
										</p>
									</div>
									<div className='grid grid-cols-2 gap-3'>
										<div>
											<label className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
												Priority
											</label>
											<p className='text-sm font-medium text-orange-600 dark:text-orange-400 mt-1'>
												{mockRequest.priority}
											</p>
										</div>
										<div>
											<label className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
												Category
											</label>
											<p className='text-sm text-gray-900 dark:text-white mt-1'>
												{mockRequest.category}
											</p>
										</div>
									</div>
									<div>
										<label className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
											Status
										</label>
										<Badge
											className={`mt-1 ${getStatusColor(mockRequest.status)}`}>
											{mockRequest.status.replace(
												'_',
												' '
											)}
										</Badge>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions */}
						<div>
							<h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-3'>
								Quick Actions
							</h3>
							<div className='space-y-2'>
								<Button
									variant='outline'
									className='w-full justify-start bg-transparent'
									size='sm'>
									<CheckCircle className='h-4 w-4 mr-2' />
									Mark as Complete
								</Button>
								<Button
									variant='outline'
									className='w-full justify-start bg-transparent'
									size='sm'>
									<Phone className='h-4 w-4 mr-2' />
									Call Tenant
								</Button>
								<Button
									variant='outline'
									className='w-full justify-start bg-transparent'
									size='sm'>
									<UserPlus className='h-4 w-4 mr-2' />
									Assign Technician
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
