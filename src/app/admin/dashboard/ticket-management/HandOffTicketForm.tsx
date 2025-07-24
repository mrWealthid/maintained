'use client';
import React, { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import {
	useFetchAdmins,
	useFetchTechnicians,
	useHandOffTicket,
	useSendTechnicianRequest
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	handOffTicketFormProps,
	SendTechnicianRequestFormControls,
	SendTechnicianRequestFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import { Ticket, User } from '@/app/shared/model/model';
import {
	PopoverTrigger,
	Popover,
	PopoverContent
} from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem
} from '@/components/ui/command';
import { Check, ChevronDown, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HandOffTicketForm: FC<handOffTicketFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { handleSubmit, control, formState } = useForm<
		Pick<Ticket, 'actionedBy'>
	>({
		mode: 'all',
		defaultValues: { actionedBy: '' }
	});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isUpdating, handleHandleOffTicket } = useHandOffTicket(
		ticket._id,
		onCloseModal
	);

	const { data: admins } = useFetchAdmins<User>();

	async function onSubmit(data: Pick<Ticket, 'actionedBy'>) {
		handleHandleOffTicket(data);
	}

	function onError(err: unknown) {
		console.log(err);
	}

	return (
		<div className='w-full'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<div className='w-full'>
						<Controller
							control={control}
							name='actionedBy'
							render={({ field }) => {
								const selectedValue = field.value;

								return (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className='w-full justify-between'
												type='button'>
												{selectedValue
													? admins?.find(
															(user) =>
																user._id ===
																selectedValue
														)?.name
													: 'Select Admin'}
												<ChevronDown className='ml-2 h-4 w-4' />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='w-[var(--radix-popover-trigger-width)] p-0'
											align='start'>
											<Command>
												<CommandInput placeholder='Search Admins...' />
												<CommandEmpty>
													No admin found.
												</CommandEmpty>
												<CommandGroup>
													{admins?.map((user) => (
														<CommandItem
															key={user._id}
															onSelect={() =>
																field.onChange(
																	user._id
																)
															}>
															<span className='mr-2'>
																{selectedValue ===
																	user._id && (
																	<Check className='h-4 w-4' />
																)}
															</span>
															{user.name}
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								);
							}}
						/>
					</div>

					<hr className='-mx-6 my-3' />
					<section className='flex justify-end  gap-4'>
						<ButtonComponent
							type='reset'
							handleClick={() => onCloseModal?.()}
							styles='rounded-3xl'
							btnText={'Cancel'}></ButtonComponent>

						<ButtonComponent
							type='submit'
							styles='rounded-3xl'
							disabled={!isValid || isSubmitting || !isDirty}
							loading={isUpdating}
							btnText={`Submit
                            `}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default HandOffTicketForm;
