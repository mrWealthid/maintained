'use client';
import { useState } from 'react';
import TicketList from '@/app/admin/dashboard/ticket-management/list/TicketList';
import ToggleView from '@/app/shared/components/toggle-views/ToggleView';
import TicketComponent from '@/app/shared/ticket-feat/pages/TicketComponent';
import { CiCirclePlus } from 'react-icons/ci';
import TransitionReveal from '@/app/shared/components/animation/TransitionReveal';
import { InteractiveTicketChat } from '@/app/shared/ticket-feat/pages/InteractiveTicketChat';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { ManageTicketForm } from '@/app/shared/ticket-feat/model/ticket.model';
import { FormProvider, useForm } from 'react-hook-form';
import TicketForm from '@/app/shared/ticket-feat/form/TicketForm';
import { CreateTicketPayload } from '@/app/shared/model/model';

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { useCreateTicket } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { useRouter } from 'next/navigation';
import { ROUTES_DEFINITION } from '@/app/shared/routes/routes';

export default function Home() {
	const [isList, setIsList] = useState(false);
	const [open, setOpen] = useState(false);

	function handleChangeView(val: boolean) {
		setIsList(val);
	}

	const { isCreating, handleCreateTicket } = useCreateTicket(false);

	const methods = useForm<ManageTicketForm>({ mode: 'all' });
	const router = useRouter();

	const onSubmit = (
		data: CreateTicketPayload,
		actions?: { onSuccess: () => void }
	) => {
		console.log('🔥 SUBMIT:', data);

		handleCreateTicket(data, {
			onSuccess: () => {
				actions?.onSuccess();
				router.push(ROUTES_DEFINITION.DASHBOARD.TICKETS);
				setOpen(false);
			}
		});
	};

	return (
		<section className='flex  gap-6 flex-col '>
			<h1 className='title'> Maintenance Requests </h1>
			<section className='flex flex-col gap-2  w-full  items-end'>
				<FormProvider {...methods}>
					<div>
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild>
								<button className='btn-primary bg-card flex items-center gap-1 rounded-3xl'>
									<CiCirclePlus size={18} />
									Create Ticket
								</button>
							</SheetTrigger>

							<SheetContent
								side='bottom'
								className='w-full  max-h-screen  overflow-y-auto  max-w-[90vw] md:max-w-full'>
								<SheetClose asChild>
									<Button
										variant='ghost'
										size='icon'
										className='absolute top-4 right-4 rounded-full p-2 text-gray-600 bg-muted hover:bg-gray-100 dark:hover:bg-gray-800'>
										<X className='w-6 h-6' />{' '}
									</Button>
								</SheetClose>

								<div className='h-full w-2/3 mx-auto flex flex-col gap-4 px-4 py-6'>
									<SheetHeader>
										<SheetTitle>Manage Ticket</SheetTitle>
										<SheetDescription>
											Seamlessly manage requests
										</SheetDescription>
									</SheetHeader>

									<TicketForm onSubmit={onSubmit} />
								</div>
							</SheetContent>
						</Sheet>

						<InteractiveTicketChat onSubmit={onSubmit}>
							<Button
								variant='outline'
								size='lg'
								className='h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent'>
								<MessageSquare className='mr-2 h-4 w-4' />
								Try Maintenance Chat
							</Button>
						</InteractiveTicketChat>
					</div>
				</FormProvider>

				<ToggleView
					isList={isList}
					handleChangeView={handleChangeView}
				/>
			</section>
			{isList ? (
				<TransitionReveal keyId='list'>
					<TicketList />
				</TransitionReveal>
			) : (
				<TransitionReveal keyId='tile'>
					<TicketComponent />
				</TransitionReveal>
			)}
		</section>
	);
}
