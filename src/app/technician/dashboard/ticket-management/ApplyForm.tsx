'use client';
import React, { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { TECHNICIAN_RESPONSE } from '@/app/shared/enums/enums';
import { useProcessTechnicianResponse } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	ApplyTechnicianFormControls,
	DeclineTicketFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns/format';
import { formatISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ErrorMessage from '@/app/shared/components/form-elements/ErrorMessage';

const ApplyForm: FC<DeclineTicketFormProps> = ({ ticket, onCloseModal }) => {
	const { isProcessing, processResponse } = useProcessTechnicianResponse(
		ticket.id,
		onCloseModal
	);

	const [isOpen, setIsOpen] = useState(false);
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState<Date | undefined>(undefined);

	const [scheduled, setScheduled] = useState(false);

	const initialDate = new Date();
	const initialStartTime = '10:30:00';
	const initialEndTime = '10:30:00';

	// const initialDate = initialDateTime ? new Date(initialDateTime) : undefined;
	// const initialTime = initialDateTime
	// 	? initialDateTime.toTimeString().split(' ')[0]
	// 	: '10:30:00';
	const { control, handleSubmit, watch, formState } =
		useForm<ApplyTechnicianFormControls>({
			mode: 'all',
			defaultValues: {
				addSchedule: false,
				schedule: {
					date: initialDate,
					startTime: initialStartTime,
					endTime: initialEndTime
				}
			}
		});

	const { errors, isSubmitting, isValid, isDirty } = formState;

	const scheduleEnabled = watch('addSchedule');
	const startTime = watch('schedule.startTime');

	const onSubmit = (data: ApplyTechnicianFormControls) => {
		// console.log('Submitted:', data);
		// let startUtc: string | null = null;
		// let endUtc: string | null = null;

		// if (scheduleEnabled) {
		// 	const { date, startTime, endTime } = data.schedule ?? {};

		// 	if (!date || !startTime || !endTime) {
		// 		console.error('All fields are required');
		// 		return;
		// 	}

		// 	// Parse start time
		// 	const result = getUtcDateTimes(date, startTime, endTime);
		// 	startUtc = result.startUtc;
		// 	endUtc = result.endUtc;

		// 	if (!startUtc || !endUtc) {
		// 		console.error('Start time must be before end time');
		// 		return;
		// 	}
		// }

		// const payload = {
		// 	quote: {
		// 		amount: data.quote?.amount,
		// 		currency: 'USD'
		// 	},
		// 	message: data.message,
		// 	response: TECHNICIAN_RESPONSE.applied,
		// 	...(scheduleEnabled &&
		// 		startUtc &&
		// 		endUtc && {
		// 			schedule: {
		// 				start: formatISO(new Date(startUtc)),
		// 				end: formatISO(new Date(endUtc))
		// 			}
		// 		})
		// };

		// // processResponse(payload, {
		// // 	onSuccess: () => onCloseModal?.()
		// // });

		// console.log('Payload to be sent:', payload);

		// console.log('Start UTC:', startUtc);
		// console.log('End UTC:', endUtc);
		// console.log(data);

		console.log('Submitted:', data);

		let startUtc: string | null = null;
		let endUtc: string | null = null;

		if (scheduleEnabled) {
			const { date, startTime, endTime } = data.schedule ?? {};

			if (!date || !startTime || !endTime) {
				console.error('❌ Schedule: Missing date or time fields.');
				return;
			}

			const { startUtc: sUtc, endUtc: eUtc } = getUtcDateTimes(
				date,
				startTime,
				endTime
			);

			if (!sUtc || !eUtc) {
				console.error(
					'❌ Schedule: Start time must be before end time.'
				);
				return;
			}

			startUtc = sUtc;
			endUtc = eUtc;
		}

		const payload = {
			quote: {
				amount: data.quote?.amount,
				currency: 'USD'
			},
			message: data.message,
			response: TECHNICIAN_RESPONSE.applied,

			// ✅ Only adds schedule key if all conditions are met
			...(scheduleEnabled &&
				startUtc &&
				endUtc && {
					schedule: {
						start: formatISO(new Date(startUtc)),
						end: formatISO(new Date(endUtc))
					}
				})
		};

		// ✅ You can now send the payload
		// processResponse(payload, {
		//   onSuccess: () => onCloseModal?.()
		// });

		console.log('📦 Payload to be sent:', payload);
		if (scheduleEnabled) {
			console.log('🕓 Start UTC:', startUtc);
			console.log('🕔 End UTC:', endUtc);
		}
	};

	function onError(err: unknown) {
		console.log(err);
	}

	function getUtcDateTimes(
		date: Date,
		startTime: string,
		endTime: string
	): { startUtc: string | null; endUtc: string | null } {
		// startTime and endTime are in "HH:mm:ss" format
		const [startHour, startMinute, startSecond] = startTime
			.split(':')
			.map(Number);
		const [endHour, endMinute, endSecond] = endTime.split(':').map(Number);

		const startDate = new Date(date);
		startDate.setHours(startHour, startMinute, startSecond, 0);

		const endDate = new Date(date);
		endDate.setHours(endHour, endMinute, endSecond, 0);

		// Ensure end is after start
		if (endDate <= startDate) {
			return { startUtc: null, endUtc: null };
		}

		return {
			startUtc: startDate.toISOString(),
			endUtc: endDate.toISOString()
		};
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onError)}
			className='flex flex-col gap-4'>
			<div className='flex flex-col gap-3'>
				<Label htmlFor='cost' className='px-1'>
					Cost
				</Label>
				<Controller
					control={control}
					rules={{ required: 'Please enter cost' }}
					name='quote.amount'
					render={({ field }) => (
						<div className='relative w-full'>
							<Input
								{...field}
								value={field.value ?? ''}
								type='text'
								id='cost'
								className='w-full pr-14 bg-transparent hover:bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							/>
							<span className='absolute right-3 top-1/2 -translate-y-1/2  text-muted-foreground text-sm pointer-events-none'>
								USD
							</span>
						</div>
					)}
				/>
			</div>

			<div className='flex flex-col gap-3'>
				<Label htmlFor='message' className='px-1'>
					Message
				</Label>
				<Controller
					control={control}
					name='message'
					render={({ field }) => (
						<Textarea
							{...field}
							id='message'
							className='w-full pr-14 bg-transparent hover:bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
						/>
					)}
				/>
			</div>

			<div className='flex items-center space-x-2'>
				<Controller
					control={control}
					name='addSchedule'
					render={({ field }) => (
						<>
							<Switch
								className={`
						data-[state=checked]:bg-foreground
					   relative inline-flex  items-center rounded-full
					 `}
								checked={!!field.value}
								onCheckedChange={field.onChange}
								id='toggle-schedule'
							/>

							<Label htmlFor='toggle-schedule'>
								Would you like to schedule now ?
							</Label>
						</>
					)}
				/>
			</div>

			{scheduleEnabled && (
				<section className='flex flex-col gap-4'>
					<div className='w-full flex flex-col gap-3'>
						<Label htmlFor='date-picker' className='px-1'>
							Date
						</Label>

						<Controller
							control={control}
							name='schedule.date'
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
												disabled={!scheduleEnabled}
												onClick={() => setIsOpen(true)}
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

					<div className=' flex flex-col md:flex-row justify-between  gap-3'>
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
					</div>
				</section>
			)}

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
					disabled={!isDirty || !isValid}
					loading={isProcessing}
					btnText={`Submit
                                    `}></ButtonComponent>
			</section>
		</form>
	);
};

export default ApplyForm;
