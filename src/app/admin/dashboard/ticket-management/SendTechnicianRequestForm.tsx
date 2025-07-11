'use client';
import React, { FC, useState } from 'react';
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
import { Check, ChevronDown, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns/format';
import { Calendar } from '@/components/ui/calendar';

const SendTechnicianRequestForm: FC<SendTechnicianRequestFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { handleSubmit, control, formState } =
		useForm<SendTechnicianRequestFormControls>({
			mode: 'all',
			defaultValues: { technicianIds: [], expiresAt: undefined }
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

					<section className='flex flex-col gap-4'>
						<div className='w-full flex flex-col gap-3'>
							<Label htmlFor='date-picker' className='px-1'>
								Deadline
							</Label>

							<Controller
								control={control}
								name='expiresAt'
								render={({ field }) => {
									const hasValue = !!field.value;
									return (
										<Popover
											open={isOpen}
											onOpenChange={setIsOpen}>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													id='date-picker'
													onClick={() =>
														setIsOpen(true)
													}
													className={` w-full bg-transparent hover:bg-transparent justify-between font-normal ${
														hasValue
															? 'text-foreground'
															: 'text-muted-foreground'
													}`}>
													{hasValue
														? format(
																field.value as Date,
																'PPP'
															) // e.g., Jul 9, 2025
														: 'Select date'}
													<ChevronDownIcon />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className='w-auto overflow-hidden p-0'
												align='start'>
												<Calendar
													mode='single'
													selected={field.value}
													captionLayout='dropdown'
													onSelect={(date) => {
														field.onChange(date);
														setIsOpen(false);
													}}
												/>
											</PopoverContent>
										</Popover>
									);
								}}
							/>
						</div>

						{/* <div className=' flex flex-col md:flex-row justify-between  gap-3'>
							<section className='flex-1'>
								{' '}
								<Label htmlFor='startTime' className='px-1'>
									Start Time
								</Label>
								<Controller
									control={control}
									name='schedule.startTime'
									render={({ field }) => (
										<Input
											type='time'
											id='startTime'
											step='1'
											disabled={!scheduleEnabled}
											{...field}
											className='w-full bg-transparent hover:bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
										/>
									)}
								/>
							</section>

							<section className='flex-1'>
								<Label htmlFor='endTime' className='px-1'>
									End Time
								</Label>
								<Controller
									control={control}
									name='schedule.endTime'
									rules={{
										validate: (value) => {
											if (!scheduleEnabled) return true;
											if (!startTime || !value)
												return 'Please enter both times';

											return (
												value > startTime ||
												'End time must be after start time'
											);
										}
									}}
									render={({ field }) => (
										<>
											<Input
												type='time'
												id='end-time'
												step='1'
												{...field}
												className='w-full bg-transparent hover:bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
											/>

											{errors.schedule?.endTime && (
												<ErrorMessage
													errorMsg={
														errors.schedule.endTime
															?.message ?? ''
													}
												/>
											)}
										</>
									)}
								/>
							</section>
						</div> */}
					</section>
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
