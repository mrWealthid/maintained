'use client';

import {
	Mail,
	Phone,
	User,
	Calendar,
	FileText,
	DollarSign,
	Info,
	AlertTriangle,
	Image as ImageIcon,
	VideoIcon,
	ChevronDown,
	Calendar1,
	Banknote,
	Sparkles,
	Sparkle,
	BadgeInfo,
	Check,
	X
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ADMIN_ROUTES_DEFINITION } from '@/app/shared/routes/routes';
import Modal from '@/app/shared/components/modal/Modal';
import { Badge } from '@/components/ui/badge';
import {
	ManageTicketDetails,
	ManageTicketDetailsProps,
	TicketDetailsResponse
} from '../model/ticket.model';
import Image from 'next/image';
import { TECHNICIAN_RESPONSE, TICKET_PRIORITY } from '../../enums/enums';

export default function TicketDetails({ ticket }: ManageTicketDetailsProps) {
	return (
		<div className='max-w-screen-3xl text-sm space-y-6'>
			{/* Header */}
			<header
				className='flex justify-between items-center'
				aria-label='Ticket Header'>
				<h1 className='text-2xl font-semibold'>Ticket Detail</h1>
				<div className='relative'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
								{/* <TfiMore /> */}
								Actions
								<ChevronDown strokeWidth={1.25} />
								<span className='sr-only'>Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-32'>
							<DropdownMenuItem>
								<Link
									href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${'12'}`}>
									View Details
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem>
								<Modal.Open opens='self-assign'>
									<button
										type='button'
										className='w-full text-left'>
										Assign to me
									</button>
								</Modal.Open>
							</DropdownMenuItem>

							<DropdownMenuItem>
								<Modal.Open opens='send-request-technicians'>
									<button
										type='button'
										className='w-full text-left'>
										Assign
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			{/* Top Section: Ticket (60%) and User (40%) */}
			<div className='flex flex-col items-start lg:flex-row gap-6'>
				{/* Ticket Details */}
				<article
					className='w-full lg:w-3/5 card rounded-3xl  space-y-4 border'
					aria-labelledby='ticket-section'>
					<h2 id='ticket-section' className='sr-only'>
						{ticket?.title}
					</h2>
					<section className='flex text-lg items-center gap-2'>
						Leaking Pipe
						{/* <FileText size={14} /> */}
						{/* <span className='font-medium'>Title:</span> Leaking Pipe */}
					</section>
					<section className='flex items-center gap-2'>
						<Info size={14} />
						<span>Status:</span>
						<Badge variant='outline'>
							{ticket?.status}
							{/*
                                                        <IconLoader/> */}
						</Badge>
					</section>
					<section className='flex items-center gap-2'>
						<AlertTriangle size={14} />
						<span>Priority:</span>
						<Badge variant='outline'>
							High
							{/*
                                                        <IconLoader/> */}
						</Badge>
					</section>
					<section className='flex items-center gap-2'>
						<FileText size={14} />

						<h3 className='font-medium'>Description:</h3>
						<p>{ticket?.description}</p>
					</section>
					<section className='flex items-center gap-2'>
						<Calendar1 strokeWidth={1} size={14} />
						<span>Date:</span>
						{ticket?.createdAt
							? new Date(ticket.createdAt).toDateString()
							: 'N/A'}
					</section>

					{/* Image Gallery */}
					{Array.isArray(ticket?.images) &&
						ticket.images.length > 0 && (
							<section>
								<h3 className='font-medium flex items-center gap-1  mb-2'>
									<ImageIcon size={14} /> <span>Images</span>
								</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
									{ticket.images.map((image, index) => (
										<figure key={index}>
											<Image
												src={image}
												alt={`Ticket image ${index + 1}`}
												width={100}
												height={100}
												className='rounded-xl border object-cover h-56 w-full'
											/>
											<figcaption className='sr-only'>
												Ticket photo {index + 1}
											</figcaption>
										</figure>
									))}
								</div>
							</section>
						)}

					{/* Video Section */}
					{Array.isArray(ticket?.videos) &&
						ticket.videos.length > 0 && (
							<section>
								<h3 className='font-medium flex items-center gap-1  mb-2'>
									<VideoIcon size={14} /> <span>Videos</span>
								</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
									{ticket.videos.map((vid, index) => (
										<video
											key={index}
											controls
											className='rounded-xl border object-cover h-56 w-full'
											src={vid}
											aria-label={`Leak video ${index + 1}`}
										/>
									))}
								</div>
							</section>
						)}
				</article>

				{/* User Details */}
				<aside
					className='w-full lg:w-2/5 card rounded-3xl p-5 space-y-4 border'
					aria-labelledby='user-details-heading'>
					<h2
						id='user-details-heading'
						className='text-lg font-semibold'>
						User Details
					</h2>
					<p className='flex items-center gap-2'>
						<User size={14} />
						<span>{ticket?.user.name}</span>
					</p>
					<p className='flex items-center gap-2'>
						<Mail size={14} />
						<span>{ticket?.user.email}</span>
					</p>
					<p className='flex items-center gap-2'>
						<Phone size={14} />
						<span>(123) 456-7890</span>
					</p>
				</aside>
			</div>

			{/* Technician Responses */}
			{Array.isArray(ticket?.requests) && ticket.requests.length > 0 && (
				<section
					className='card rounded-3xl p-5 border space-y-6'
					aria-labelledby='technician-responses-heading'>
					<h2
						id='technician-responses-heading'
						className='text-lg font-semibold'>
						Technician Responses
					</h2>

					{ticket.requests.map((request, idx) => (
						<article
							key={idx}
							className='space-y-4 border-t pt-4'
							aria-label={`Technician response ${idx + 1}`}>
							<div className='flex items-center gap-2'>
								<User size={14} />
								<span className='font-medium'>
									{request.technician.name}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<Info size={14} />
								<Badge variant='outline'>
									{request.status}
									{/*
                                                        <IconLoader/> */}
								</Badge>
							</div>
							<div className='flex items-center gap-2'>
								<BadgeInfo size={14} />
								<Badge className='flex gap-1' variant='outline'>
									{request.isActive ? (
										<Sparkles
											size={16}
											color='#f1d104'
											strokeWidth={1}
										/>
									) : (
										<Sparkle
											size={16}
											color='#f1d104'
											strokeWidth={1}
										/>
									)}

									{request.isActive ? 'Active' : 'Expired'}
									{/*
                                                        <IconLoader/> */}
								</Badge>
							</div>

							{request.quote.amount && (
								<div className='flex items-center gap-2'>
									<Banknote strokeWidth={1} />
									<span className='font-medium'>
										{request.quote.amount}
									</span>
								</div>
							)}
							{request.schedule && (
								<p>
									The estimated cost for the repair is{' '}
									<span className='font-medium'>
										${request.quote.amount}
									</span>
								</p>
							)}
							{request.schedule && (
								<div className='flex items-center gap-2'>
									<Calendar size={14} />
									<span>
										Visit scheduled for{' '}
										{new Date(
											request.schedule.date
										).toDateString()}{' '}
										from {request.schedule.start} to{' '}
										{request.schedule.end}
									</span>
								</div>
							)}
							<div className='flex gap-2'>
								{request.status ===
									TECHNICIAN_RESPONSE.pending && (
									<>
										{/* <button
											className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
											aria-label='Approve technician response'>
											Approve
										</button> */}

										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
											<Check
												color='#2ecd0e'
												strokeWidth={1.25}
											/>
											<span className='sr-only'>
												Assign
											</span>
											Assign
										</Button>
										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
											<X
												color='#bf0303'
												strokeWidth={1}
											/>
											<span className='sr-only'>
												Decline
											</span>
											Decline
										</Button>
									</>
								)}

								{request.status ===
									TECHNICIAN_RESPONSE.applied && (
									<>
										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
											<Check
												color='#2ecd0e'
												strokeWidth={1.25}
											/>
											<span className='sr-only'>
												Assign
											</span>
											Assign
										</Button>

										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
											<X
												color='#bf0303'
												strokeWidth={1}
											/>
											<span className='sr-only'>
												Decline
											</span>
											Decline
										</Button>
									</>
								)}
							</div>
						</article>
					))}
				</section>
			)}
		</div>
	);
}
