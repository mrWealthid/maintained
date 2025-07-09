'use client';
import React, { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import {
	useFetchTechnicians,
	useSendTechnicianRequest
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	SendTechnicianRequestFormControls,
	SendTechnicianRequestFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
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

const SendTechnicianRequestForm: FC<SendTechnicianRequestFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const { handleSubmit, control, formState } =
		useForm<SendTechnicianRequestFormControls>({
			mode: 'all',
			defaultValues: { technicianIds: [] }
		});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isSending, handleSendTechnicianRequest } = useSendTechnicianRequest(
		ticket._id,
		onCloseModal
	);

	const { data: technicians } = useFetchTechnicians<User>();

	async function onSubmit(data: SendTechnicianRequestFormControls) {
		handleSendTechnicianRequest(data);
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
							name='technicianIds'
							render={({ field }) => {
								const selectedValues = field.value;

								return (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className=' w-full justify-between'
												type='button'>
												{selectedValues.length > 0
													? technicians
															?.filter((user) =>
																selectedValues.includes(
																	user._id
																)
															)
															.map(
																(user) =>
																	user.name
															)
															.join(', ')
													: 'Select technicians'}
												<ChevronDown className='ml-2 h-4 w-4' />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='w-[var(--radix-popover-trigger-width)] p-0'
											align='start'>
											<Command className=''>
												<CommandInput placeholder='Search technicians...' />
												<CommandEmpty>
													No technician found.
												</CommandEmpty>
												<CommandGroup>
													{technicians?.map(
														(user) => {
															const isSelected =
																selectedValues.includes(
																	user._id
																);
															return (
																<CommandItem
																	key={
																		user._id
																	}
																	onSelect={() => {
																		if (
																			isSelected
																		) {
																			field.onChange(
																				selectedValues.filter(
																					(
																						v
																					) =>
																						v !==
																						user._id
																				)
																			);
																		} else {
																			field.onChange(
																				[
																					...selectedValues,
																					user._id
																				]
																			);
																		}
																	}}>
																	<span className='mr-2'>
																		{isSelected ? (
																			<Check className='h-4 w-4' />
																		) : null}
																	</span>
																	{user.name}
																</CommandItem>
															);
														}
													)}
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
							loading={isSending}
							btnText={`Submit
                            `}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default SendTechnicianRequestForm;
