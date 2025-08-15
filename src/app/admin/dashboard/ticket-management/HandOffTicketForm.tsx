'use client';
import React, { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import {
	useFetchAdmins,
	useHandOffTicket
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { handOffTicketFormProps } from '@/app/shared/ticket-feat/model/ticket.model';
import { User } from '@/app/shared/model/model';
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
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HandOffTicketForm: FC<handOffTicketFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { handleSubmit, control, formState } = useForm<{
		actionedBy: string;
	}>({
		mode: 'all',
		defaultValues: { actionedBy: '' }
	});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isUpdating, handleHandleOffTicket } = useHandOffTicket(
		ticket.id,
		onCloseModal
	);

	const { data: admins } = useFetchAdmins<User>();

	async function onSubmit(data: { actionedBy: string }) {
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
									<Popover
										open={isOpen}
										onOpenChange={setIsOpen}>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className='w-full justify-between'
												type='button'>
												{selectedValue
													? admins?.find(
															(user) =>
																user.id ===
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
															key={user.id}
															onSelect={() => {
																field.onChange(
																	user.id
																);
																setIsOpen(
																	false
																);
															}}>
															<span className='mr-2'>
																{selectedValue ===
																	user.id && (
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

					<hr className=' my-3' />
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
