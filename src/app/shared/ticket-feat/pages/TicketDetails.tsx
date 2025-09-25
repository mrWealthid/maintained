// export default function TicketDetails({ ticket }: ManageTicketDetailsProps) {
// 	return (
// 		<div className='max-w-screen-3xl text-sm space-y-6'>
// 			{/* Header */}
// 			<header
// 				className='flex justify-between items-center'
// 				aria-label='Ticket Header'>
// 				<h1 className='text-2xl font-semibold'>Ticket Detail</h1>
// 				<div className='relative'>
// 					<DropdownMenu>
// 						<DropdownMenuTrigger asChild>
// 							<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 								{/* <TfiMore /> */}
// 								Actions
// 								<ChevronDown strokeWidth={1.25} />
// 								<span className='sr-only'>Open menu</span>
// 							</Button>
// 						</DropdownMenuTrigger>
// 						<DropdownMenuContent align='end' className='w-32'>
// 							<DropdownMenuItem>
// 								<Link
// 									href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${'12'}`}>
// 									View Details
// 								</Link>
// 							</DropdownMenuItem>

// 							<DropdownMenuItem>
// 								<Modal.Open opens='self-assign'>
// 									<button
// 										type='button'
// 										className='w-full text-left'>
// 										Assign to me
// 									</button>
// 								</Modal.Open>
// 							</DropdownMenuItem>

// 							<DropdownMenuItem>
// 								<Modal.Open opens='send-request-technicians'>
// 									<button
// 										type='button'
// 										className='w-full text-left'>
// 										Assign
// 									</button>
// 								</Modal.Open>
// 							</DropdownMenuItem>
// 						</DropdownMenuContent>
// 					</DropdownMenu>
// 				</div>
// 			</header>

// 			{/* Top Section: Ticket (60%) and User (40%) */}
// 			<div className='flex flex-col items-start lg:flex-row gap-6'>
// 				{/* Ticket Details */}
// 				<article
// 					className='w-full lg:w-3/5 card rounded-3xl  space-y-4 border'
// 					aria-labelledby='ticket-section'>
// 					<h2 id='ticket-section' className='sr-only'>
// 						{ticket?.title}
// 					</h2>
// 					<section className='flex text-lg items-center gap-2'>
// 						Leaking Pipe
// 						{/* <FileText size={14} /> */}
// 						{/* <span className='font-medium'>Title:</span> Leaking Pipe */}
// 					</section>
// 					<section className='flex items-center gap-2'>
// 						<Info size={14} />
// 						<span>Status:</span>
// 						<Badge variant='outline'>
// 							{ticket?.status}
// 							{/*
//                                                         <IconLoader/> */}
// 						</Badge>
// 					</section>
// 					<section className='flex items-center gap-2'>
// 						<AlertTriangle size={14} />
// 						<span>Priority:</span>
// 						<Badge variant='outline'>
// 							High
// 							{/*
//                                                         <IconLoader/> */}
// 						</Badge>
// 					</section>
// 					<section className='flex items-center gap-2'>
// 						<FileText size={14} />

// 						<h3 className='font-medium'>Description:</h3>
// 						<p>{ticket?.description}</p>
// 					</section>
// 					<section className='flex items-center gap-2'>
// 						<Calendar1 strokeWidth={1} size={14} />
// 						<span>Date:</span>
// 						{ticket?.createdAt
// 							? new Date(ticket.createdAt).toDateString()
// 							: 'N/A'}
// 					</section>

// 					{/* Image Gallery */}
// 					{Array.isArray(ticket?.images) &&
// 						ticket.images.length > 0 && (
// 							<section>
// 								<h3 className='font-medium flex items-center gap-1  mb-2'>
// 									<ImageIcon size={14} /> <span>Images</span>
// 								</h3>
// 								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
// 									{ticket.images.map((image, index) => (
// 										<figure key={index}>
// 											<Image
// 												src={image}
// 												alt={`Ticket image ${index + 1}`}
// 												width={100}
// 												height={100}
// 												className='rounded-xl border object-cover h-56 w-full'
// 											/>
// 											<figcaption className='sr-only'>
// 												Ticket photo {index + 1}
// 											</figcaption>
// 										</figure>
// 									))}
// 								</div>
// 							</section>
// 						)}

// 					{/* Video Section */}
// 					{Array.isArray(ticket?.videos) &&
// 						ticket.videos.length > 0 && (
// 							<section>
// 								<h3 className='font-medium flex items-center gap-1  mb-2'>
// 									<VideoIcon size={14} /> <span>Videos</span>
// 								</h3>
// 								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
// 									{ticket.videos.map((vid, index) => (
// 										<video
// 											key={index}
// 											controls
// 											className='rounded-xl border object-cover h-56 w-full'
// 											src={vid}
// 											aria-label={`Leak video ${index + 1}`}
// 										/>
// 									))}
// 								</div>
// 							</section>
// 						)}
// 				</article>

// 				{/* User Details */}
// 				<aside
// 					className='w-full lg:w-2/5 card rounded-3xl p-5 space-y-4 border'
// 					aria-labelledby='user-details-heading'>
// 					<h2
// 						id='user-details-heading'
// 						className='text-lg font-semibold'>
// 						User Details
// 					</h2>
// 					<p className='flex items-center gap-2'>
// 						<User size={14} />
// 						<span>{ticket?.user.name}</span>
// 					</p>
// 					<p className='flex items-center gap-2'>
// 						<Mail size={14} />
// 						<span>{ticket?.user.email}</span>
// 					</p>
// 					<p className='flex items-center gap-2'>
// 						<Phone size={14} />
// 						<span>(123) 456-7890</span>
// 					</p>
// 				</aside>
// 			</div>

// 			{/* Technician Responses */}
// 			{Array.isArray(ticket?.requests) && ticket.requests.length > 0 && (
// 				<section
// 					className='card rounded-3xl p-5 border space-y-6'
// 					aria-labelledby='technician-responses-heading'>
// 					<h2
// 						id='technician-responses-heading'
// 						className='text-lg font-semibold'>
// 						Technician Responses
// 					</h2>

// 					{ticket.requests.map((request, idx) => (
// 						<article
// 							key={idx}
// 							className='space-y-4 border p-4 rounded-2xl'
// 							aria-label={`Technician response ${idx + 1}`}>
// 							<div className='flex  rounded-lg justify-between'>
// 								<div className='flex w-full  flex-col  gap-2'>
// 									<div className='flex gap-2 justify-between items-center'>
// 										<span className='flex items-center gap-1'>
// 											<User size={14} />
// 											<span className='font-medium'>
// 												{request.technician.name}
// 											</span>
// 										</span>
// 										<div className='flex items-center gap-2'>
// 											<Badge
// 												variant='outline'
// 												className='gap-1'>
// 												{request.status ===
// 													TECHNICIAN_RESPONSE.applied && (
// 													<CircleCheck
// 														strokeWidth={1.25}
// 														size={14}
// 														color='green'
// 													/>
// 												)}

// 												{request.status ===
// 													TECHNICIAN_RESPONSE.pending && (
// 													<Loader
// 														strokeWidth={1.25}
// 														size={14}
// 													/>
// 												)}
// 												{request.status}
// 											</Badge>
// 										</div>
// 									</div>
// 									<Table className=''>
// 										<TableHeader>
// 											<TableRow className='bg-muted rounded-lg'>
// 												<TableHead className='text-xs'>
// 													Item
// 												</TableHead>
// 												<TableHead className='text-right text-xs'>
// 													Amount (₦)
// 												</TableHead>
// 											</TableRow>
// 										</TableHeader>

// 										<TableBody>
// 											{request.quote.cost.map(
// 												(item, index) => (
// 													<TableRow key={index}>
// 														<TableCell className='truncate capitalize text-xs'>
// 															{item.title}
// 														</TableCell>
// 														<TableCell className='text-right text-xs'>
// 															{Number(
// 																item.amount || 0
// 															).toLocaleString()}
// 														</TableCell>
// 													</TableRow>
// 												)
// 											)}

// 											<TableRow className='font-bold border-t'>
// 												<TableCell className='text-sm'>
// 													Total
// 												</TableCell>
// 												<TableCell className='text-right text-sm'>
// 													{request.quote.total.toLocaleString()}
// 												</TableCell>
// 											</TableRow>
// 										</TableBody>
// 									</Table>
// 								</div>

// 								<div className=' flex justify-end w-full relative'>
// 									<DropdownMenu>
// 										<DropdownMenuTrigger asChild>
// 											<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 												{/* <TfiMore /> */}
// 												Actions
// 												<ChevronDown
// 													strokeWidth={1.25}
// 												/>
// 												<span className='sr-only'>
// 													Open menu
// 												</span>
// 											</Button>
// 										</DropdownMenuTrigger>
// 										<DropdownMenuContent
// 											align='end'
// 											className='w-48'>
// 											<DropdownMenuItem>
// 												<Link
// 													href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${'12'}`}>
// 													Approve
// 												</Link>
// 											</DropdownMenuItem>

// 											<DropdownMenuItem>
// 												<Modal.Open opens='self-assign'>
// 													<button
// 														type='button'
// 														className='w-full text-left'>
// 														Withdraw
// 													</button>
// 												</Modal.Open>
// 											</DropdownMenuItem>

// 											<DropdownMenuItem>
// 												<Modal.Open opens='self-assign'>
// 													<button
// 														type='button'
// 														className='w-full text-left'>
// 														Update Schedule
// 													</button>
// 												</Modal.Open>
// 											</DropdownMenuItem>

// 											<DropdownMenuItem>
// 												<Modal.Open opens='send-request-technicians'>
// 													<button
// 														type='button'
// 														className='w-full text-left'>
// 														Decline
// 													</button>
// 												</Modal.Open>
// 											</DropdownMenuItem>
// 										</DropdownMenuContent>
// 									</DropdownMenu>
// 								</div>
// 							</div>
// 							{request.schedule && (
// 								<p>
// 									The estimated cost for the repair is{' '}
// 									<span className='font-medium'>
// 										${request.quote.total}
// 									</span>
// 								</p>
// 							)}
// 							{request.schedule && (
// 								<div className='flex items-center gap-2'>
// 									<Calendar size={14} />
// 									<span className='flex gap-1'>
// 										Repair scheduled for
// 										<span className='font-bold'>
// 											{new Date(
// 												request.schedule.date
// 											).toDateString()}
// 										</span>
// 										from
// 										<span className='font-bold'>
// 											{new Date(
// 												request.schedule.start
// 											).toLocaleTimeString()}
// 										</span>
// 										to
// 										<span className='font-bold'>
// 											{new Date(
// 												request.schedule.end
// 											).toLocaleTimeString()}
// 										</span>
// 									</span>
// 								</div>
// 							)}
// 							<div className='flex gap-2'>
// 								{request.status ===
// 									TECHNICIAN_RESPONSE.pending && (
// 									<>
// 										{/* <button
// 											className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
// 											aria-label='Approve technician response'>
// 											Approve
// 										</button> */}

// 										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 											<Check
// 												color='#2ecd0e'
// 												strokeWidth={1.25}
// 											/>
// 											<span className='sr-only'>
// 												Assign
// 											</span>
// 											Assign
// 										</Button>
// 										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 											<X
// 												color='#bf0303'
// 												strokeWidth={1}
// 											/>
// 											<span className='sr-only'>
// 												Decline
// 											</span>
// 											Decline
// 										</Button>
// 									</>
// 								)}

// 								{/* {request.status ===
// 									TECHNICIAN_RESPONSE.applied && (
// 									<>
// 										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 											<Check
// 												color='#2ecd0e'
// 												strokeWidth={1.25}
// 											/>
// 											<span className='sr-only'>
// 												Assign
// 											</span>
// 											Assign
// 										</Button>

// 										<Button className='bg-button-primary hover:bg-button-accent text-button-primary-foreground flex'>
// 											<X
// 												color='#bf0303'
// 												strokeWidth={1}
// 											/>
// 											<span className='sr-only'>
// 												Decline
// 											</span>
// 											Decline
// 										</Button>
// 									</>
// 								)} */}
// 							</div>
// 						</article>
// 					))}
// 				</section>
// 			)}
// 		</div>
// 	);
// }

// import type React from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   AlertTriangle,
//   Calendar,
//   Check,
//   ChevronDown,
//   CircleCheck,
//   Clock,
//   FileText,
//   ImageIcon,
//   Info,
//   Mail,
//   MoreHorizontal,
//   Phone,
//   User,
//   VideoIcon,
//   X,
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// // Assuming these are imported from your constants
// const ADMIN_ROUTES_DEFINITION = {
//   DASHBOARD: {
//     TICKETS: "/dashboard/tickets",
//   },
// };

// const TECHNICIAN_RESPONSE = {
//   applied: "applied",
//   pending: "pending",
// };

// // Mock Modal component - replace with your actual Modal
// const Modal = {
//   Open: ({ opens, children }: { opens: string; children: React.ReactNode }) => (
//     <div>{children}</div>
//   ),
// };

// interface ManageTicketDetailsProps {
//   ticket: {
//     title: string;
//     status: string;
//     priority: string;
//     description: string;
//     createdAt: string;
//     images?: string[];
//     videos?: string[];
//     user: {
//       name: string;
//       email: string;
//     };
//     requests?: Array<{
//       technician: {
//         name: string;
//       };
//       status: string;
//       quote: {
//         cost: Array<{
//           title: string;
//           amount: number;
//         }>;
//         total: number;
//       };
//       schedule?: {
//         date: string;
//         start: string;
//         end: string;
//       };
//     }>;
//   };
// }

// const getPriorityColor = (priority: string) => {
//   switch (priority?.toLowerCase()) {
//     case "high":
//       return "destructive";
//     case "medium":
//       return "default";
//     case "low":
//       return "secondary";
//     default:
//       return "outline";
//   }
// };

// const getStatusColor = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case "open":
//       return "default";
//     case "in-progress":
//       return "secondary";
//     case "resolved":
//       return "outline";
//     case "closed":
//       return "secondary";
//     default:
//       return "outline";
//   }
// };

// export default function TicketDetails({ ticket }: ManageTicketDetailsProps) {
//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-8  min-h-screen">
//       {/* Professional Header */}
//       <div className=" rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="space-y-1">
//             <h1 className="text-3xl font-bold text-gray-900">
//               {ticket?.title || "Ticket Details"}
//             </h1>
//             <p className="text-gray-600">
//               Created on{" "}
//               {ticket?.createdAt
//                 ? new Date(ticket.createdAt).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })
//                 : "N/A"}
//             </p>
//           </div>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="gap-2 bg-transparent">
//                 <MoreHorizontal className="h-4 w-4" />
//                 Actions
//                 <ChevronDown className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               <DropdownMenuItem>
//                 <Link href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/12`}>
//                   View Details
//                 </Link>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Modal.Open opens="self-assign">
//                   <button type="button" className="w-full text-left">
//                     Assign to me
//                   </button>
//                 </Modal.Open>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Modal.Open opens="send-request-technicians">
//                   <button type="button" className="w-full text-left">
//                     Assign Technician
//                   </button>
//                 </Modal.Open>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Ticket Details - Takes up 2 columns */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card className="shadow-sm border-gray-200">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <FileText className="h-5 w-5 text-blue-600" />
//                 Ticket Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Status and Priority Row */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="flex items-center gap-3">
//                   <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
//                     <Info className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Status</p>
//                     <Badge
//                       variant={getStatusColor(ticket?.status)}
//                       className="mt-1"
//                     >
//                       {ticket?.status}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
//                     <AlertTriangle className="h-4 w-4 text-orange-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">
//                       Priority
//                     </p>
//                     <Badge variant={getPriorityColor("High")} className="mt-1">
//                       High
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Description */}
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                   <FileText className="h-4 w-4" />
//                   Description
//                 </h3>
//                 <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
//                   {ticket?.description}
//                 </p>
//               </div>

//               {/* Media Gallery */}
//               {Array.isArray(ticket?.images) && ticket.images.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                     <ImageIcon className="h-4 w-4" />
//                     Attached Images ({ticket.images.length})
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {ticket.images.map((image, index) => (
//                       <div
//                         key={index}
//                         className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
//                       >
//                         <Image
//                           src={image || "/placeholder.svg"}
//                           alt={`Ticket image ${index + 1}`}
//                           width={300}
//                           height={200}
//                           className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-200"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Video Section */}
//               {Array.isArray(ticket?.videos) && ticket.videos.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                     <VideoIcon className="h-4 w-4" />
//                     Attached Videos ({ticket.videos.length})
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {ticket.videos.map((vid, index) => (
//                       <video
//                         key={index}
//                         controls
//                         className="rounded-lg border border-gray-200 w-full h-48 object-cover"
//                         src={vid}
//                         aria-label={`Video ${index + 1}`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* User Details Sidebar */}
//         <div className="space-y-6">
//           <Card className="shadow-sm border-gray-200">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <User className="h-5 w-5 text-green-600" />
//                 Customer Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
//                     <User className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                       Name
//                     </p>
//                     <p className="font-medium text-gray-900">
//                       {ticket?.user.name}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
//                     <Mail className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                       Email
//                     </p>
//                     <p className="font-medium text-gray-900">
//                       {ticket?.user.email}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
//                     <Phone className="h-4 w-4 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                       Phone
//                     </p>
//                     <p className="font-medium text-gray-900">(123) 456-7890</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Technician Responses */}
//       {Array.isArray(ticket?.requests) && ticket.requests.length > 0 && (
//         <Card className="shadow-sm border-gray-200">
//           <CardHeader className="pb-4">
//             <CardTitle className="flex items-center gap-2 text-xl">
//               <User className="h-5 w-5 text-indigo-600" />
//               Technician Responses ({ticket.requests.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {ticket.requests.map((request, idx) => (
//               <div
//                 key={idx}
//                 className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
//               >
//                 {/* Technician Header */}
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
//                       <User className="h-5 w-5 text-indigo-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">
//                         {request.technician.name}
//                       </h4>
//                       <Badge
//                         variant={
//                           request.status === TECHNICIAN_RESPONSE.applied
//                             ? "default"
//                             : "secondary"
//                         }
//                         className="mt-1 gap-1"
//                       >
//                         {request.status === TECHNICIAN_RESPONSE.applied && (
//                           <CircleCheck className="h-3 w-3 text-green-600" />
//                         )}
//                         {request.status === TECHNICIAN_RESPONSE.pending && (
//                           <Clock className="h-3 w-3" />
//                         )}
//                         {request.status}
//                       </Badge>
//                     </div>
//                   </div>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="gap-2 bg-transparent"
//                       >
//                         <MoreHorizontal className="h-4 w-4" />
//                         Actions
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-48">
//                       <DropdownMenuItem>
//                         <Link
//                           href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/12`}
//                         >
//                           Approve
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem>
//                         <Modal.Open opens="self-assign">
//                           <button type="button" className="w-full text-left">
//                             Withdraw
//                           </button>
//                         </Modal.Open>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem>
//                         <Modal.Open opens="self-assign">
//                           <button type="button" className="w-full text-left">
//                             Update Schedule
//                           </button>
//                         </Modal.Open>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem>
//                         <Modal.Open opens="send-request-technicians">
//                           <button type="button" className="w-full text-left">
//                             Decline
//                           </button>
//                         </Modal.Open>
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>

//                 {/* Quote Table */}
//                 <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                   <h5 className="font-medium text-gray-900 mb-3">
//                     Cost Breakdown
//                   </h5>
//                   <Table>
//                     <TableHeader>
//                       <TableRow className="border-gray-200">
//                         <TableHead className="font-medium text-gray-700">
//                           Item
//                         </TableHead>
//                         <TableHead className="text-right font-medium text-gray-700">
//                           Amount (₦)
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {request.quote.cost.map((item, index) => (
//                         <TableRow key={index} className="border-gray-200">
//                           <TableCell className="capitalize">
//                             {item.title}
//                           </TableCell>
//                           <TableCell className="text-right font-medium">
//                             ₦{Number(item.amount || 0).toLocaleString()}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       <TableRow className="border-t-2 border-gray-300 bg-gray-100">
//                         <TableCell className="font-bold text-gray-900">
//                           Total
//                         </TableCell>
//                         <TableCell className="text-right font-bold text-gray-900">
//                           ₦{request.quote.total.toLocaleString()}
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </div>

//                 {/* Schedule Information */}
//                 {request.schedule && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-2 text-blue-800">
//                       <Calendar className="h-4 w-4" />
//                       <span className="font-medium">Scheduled Repair</span>
//                     </div>
//                     <p className="text-blue-700 mt-2">
//                       <span className="font-semibold">
//                         {new Date(request.schedule.date).toDateString()}
//                       </span>
//                       {" from "}
//                       <span className="font-semibold">
//                         {new Date(request.schedule.start).toLocaleTimeString(
//                           [],
//                           {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           }
//                         )}
//                       </span>
//                       {" to "}
//                       <span className="font-semibold">
//                         {new Date(request.schedule.end).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </span>
//                     </p>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 {request.status === TECHNICIAN_RESPONSE.pending && (
//                   <div className="flex gap-3 pt-2">
//                     <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
//                       <Check className="h-4 w-4" />
//                       Approve & Assign
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="border-red-200 text-red-600 hover:bg-red-50 gap-2 bg-transparent"
//                     >
//                       <X className="h-4 w-4" />
//                       Decline
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

"use client";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  ImageIcon,
  MoreHorizontal,
  User,
  VideoIcon,
} from "lucide-react";
import Image from "next/image";
import { ManageTicketDetailsProps } from "../model/ticket.model";
import {
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "../../enums/enums";
import ConfirmationPage from "../../components/ui/ConfirmationPage";
import Modal from "../../components/modal/Modal";
import { useAssignTechnician } from "../hooks/ticketHooks";

const ADMIN_ROUTES_DEFINITION = {
  DASHBOARD: {
    TICKETS: "/dashboard/tickets",
  },
};

// const TECHNICIAN_RESPONSE = {
//   applied: "applied",
//   pending: "pending",
// };

const getPriorityColor = (priority: TICKET_PRIORITY | undefined) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusColor = (status: TICKET_STATUS | undefined) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "default";
    case "in-progress":
      return "secondary";
    case "resolved":
      return "outline";
    case "closed":
      return "secondary";
    default:
      return "outline";
  }
};

export default function TicketDetails({ ticket }: ManageTicketDetailsProps) {
  const { isAssigning, handleAssignTechnician } = useAssignTechnician(
    ticket?.id!
  );

  function handleTechnicianAssign(
    onCloseModal: () => void,
    assignedTo: string
  ) {
    const payload = {
      assignedTo,
    };
    handleAssignTechnician(payload, {
      onSuccess: () => onCloseModal(),
    });
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background min-h-screen">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-card-foreground">
              {ticket?.title || "Ticket Details"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created on{" "}
              {ticket?.createdAt
                ? new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <MoreHorizontal className="h-4 w-4" />
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* <DropdownMenuItem>
                <Link href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${}`}>
                  View Details
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem>
                <Modal.Open opens="self-assign">
                  <button type="button" className="w-full text-left">
                    Assign to me
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Modal.Open opens="send-request-technicians">
                  <button type="button" className="w-full text-left">
                    Assign Technician
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={getStatusColor(ticket?.status)}
                    className="text-sm"
                  >
                    {ticket?.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Priority
                  </p>
                  <Badge
                    variant={getPriorityColor(ticket?.priority)}
                    className="text-sm"
                  >
                    {ticket?.priority}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium text-card-foreground">
                  Description
                </h3>
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-foreground leading-relaxed">
                    {ticket?.description}
                  </p>
                </div>
              </div>

              {Array.isArray(ticket?.images) && ticket.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-card-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Attached Images ({ticket.images.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ticket.images.map((image, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-border bg-card"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Ticket image ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-48"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(ticket?.videos) && ticket.videos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-card-foreground flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" />
                    Attached Videos ({ticket.videos.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ticket.videos.map((vid, index) => (
                      <video
                        key={index}
                        controls
                        className="rounded-lg border border-border w-full h-48 object-cover"
                        src={vid}
                        aria-label={`Video ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-card-foreground">{ticket?.user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-card-foreground">{ticket?.user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-card-foreground">(123) 456-7890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {Array.isArray(ticket?.requests) && ticket.requests.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Technician Responses ({ticket.requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticket.requests.map((request, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-6 bg-muted/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-card-foreground">
                        {request.technician.name}
                      </h4>
                      <Badge variant={"outline"} className="mt-1 text-xs">
                        {request.status === TECHNICIAN_RESPONSE.applied && (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {request.status === TECHNICIAN_RESPONSE.pending && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={"outline"} className="mt-1 text-xs">
                      {ticket.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="">
                        <DropdownMenuItem>
                          <Modal.Open
                            opens="assign-technician"
                            payload={request.technician.id}
                          >
                            <button type="button" className="w-full text-left">
                              Assign
                            </button>
                          </Modal.Open>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Modal.Open opens="self-assign">
                            <button type="button" className="w-full text-left">
                              Withdraw
                            </button>
                          </Modal.Open>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Modal.Open opens="self-assign">
                            <button type="button" className="w-full text-left">
                              Update Schedule
                            </button>
                          </Modal.Open>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Modal.Open opens="send-request-technicians">
                            <button type="button" className="w-full text-left">
                              Decline
                            </button>
                          </Modal.Open>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {request.quote.cost.length > 0 && (
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <h5 className="font-medium text-card-foreground mb-3">
                      Cost Breakdown
                    </h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">
                            Amount (₦)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {request.quote.cost.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize">
                              {item.title}
                            </TableCell>
                            <TableCell className="text-right">
                              ₦{Number(item.amount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2">
                          <TableCell className="font-medium">Total</TableCell>
                          <TableCell className="text-right font-medium">
                            ₦{request.quote.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                {request.schedule && (
                  <div className="bg-background border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Scheduled Repair</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.schedule.date).toDateString()} from{" "}
                      {new Date(request.schedule.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      to{" "}
                      {new Date(request.schedule.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}

                {/* {request.status === TECHNICIAN_RESPONSE.pending && (
                  <div className="flex gap-3 pt-2">
                    <Button size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )} */}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* <Modal.Window
        name="assign-technician"
        title="Assign Technician"
        description="Technician would be assigned to ticket"
      >
        {({ onCloseModal, data }) => (
          <ConfirmationPage
            handler={() =>
              handleTechnicianAssign(onCloseModal, (data as any)?.technicianId)
            }
            isLoading={isAssigning}
            modalText="Are you sure you want to assign this ticket"
            reason="confirm"
          />
        )}
      </Modal.Window> */}

      <Modal.Window
        name="assign-technician"
        title="Assign Technician"
        description="Technician would be assigned to ticket"
      >
        <ConfirmationPage
          handler={(onCloseModal: () => void, data: any) => {
            handleTechnicianAssign(onCloseModal ?? (() => {}), data);
          }}
          isLoading={isAssigning}
          modalText="Are you sure you want to assign this ticket"
          reason="confirm"
        />
      </Modal.Window>

      {/* <Modal.Window
        name="assign-technician"
        title="Assign Technician"
        description="Technician would be assigned to ticket"
      >
        <ConfirmationPage
          handler={(onCloseModal) => {
            handleTechnicianAssign(onCloseModal ?? (() => {}), "66777");
          }}
          isLoading={isAssigning}
          modalText={"Are you sure you want to assign this ticket"}
          reason="confirm"
        />
      </Modal.Window> */}
    </div>
  );
}
