'use client';
import React, { FC, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { TECHNICIAN_RESPONSE } from '@/app/shared/enums/enums';
import { useProcessTechnicianResponse } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	ApplyTechnicianFormControls,
	ApplyTicketFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { ChevronDownIcon, CirclePlus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns/format';
import { formatISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ErrorMessage from '@/app/shared/components/form-elements/ErrorMessage';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { TECHNICIAN_ROUTES_DEFINITION } from '@/app/shared/routes/routes';

const ApplyForm: FC<ApplyTicketFormProps> = ({ ticketRequest }) => {
	const { isProcessing, processResponse } = useProcessTechnicianResponse(
		ticketRequest.id
	);

	const [isOpen, setIsOpen] = useState(false);

	const initialDate = ticketRequest.schedule?.date
		? new Date(ticketRequest.schedule.date)
		: new Date();
	const initialStartTime = ticketRequest.schedule?.start
		? new Date(ticketRequest.schedule.start).toTimeString().split(' ')[0]
		: '10:30:00';
	const initialEndTime = ticketRequest.schedule?.end
		? new Date(ticketRequest.schedule.end).toTimeString().split(' ')[0]
		: '11:30:00';

	const { control, handleSubmit, watch, formState, trigger } =
		useForm<ApplyTechnicianFormControls>({
			mode: 'onChange',
			defaultValues: {
				addSchedule: !!ticketRequest.schedule,
				quote: {
					total: ticketRequest.quote.total || undefined,
					currency: ticketRequest.quote.currency || 'USD',
					cost: ticketRequest.quote.cost?.length
						? ticketRequest.quote.cost
						: []
				},
				message: ticketRequest.message || '',
				schedule: {
					date: initialDate,
					startTime: initialStartTime,
					endTime: initialEndTime
				}
			}
		});

	const router = useRouter();
	const { errors, isSubmitting, isValid, isDirty } = formState;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'quote.cost'
	});

	const watchCosts = watch('quote.cost');
	const scheduleEnabled = watch('addSchedule');
	const startTime = watch('schedule.startTime');

	const totalCost = useMemo(
		() =>
			watchCosts?.reduce(
				(sum, item) => sum + (Number(item.amount) || 0),
				0
			) ?? 0,
		[watchCosts]
	);

	const handleAddCost = async () => {
		const valid = await trigger('quote.cost'); // validate the entire costs array
		if (valid) {
			append({ title: '', amount: 0 });
		}
	};

	const onSubmit = (data: ApplyTechnicianFormControls) => {
		let startUtc: string | null = null;
		let endUtc: string | null = null;
		let requestDate: Date | undefined = undefined;

		if (scheduleEnabled) {
			const { date, startTime, endTime } = data.schedule ?? {};

			if (!date || !startTime || !endTime) {
				console.error('Schedule: Missing date or time fields.');
				return;
			}

			const { startUtc: sUtc, endUtc: eUtc } = getUtcDateTimes(
				date,
				startTime,
				endTime
			);

			if (!sUtc || !eUtc) {
				console.error('Schedule: Start time must be before end time.');
				return;
			}
			requestDate = date;
			startUtc = sUtc;
			endUtc = eUtc;
		}

		const payload = {
			quote: {
				...(data.quote?.total && { total: data.quote?.total }),
				cost: data.quote.cost
			},
			message: data.message,
			status: TECHNICIAN_RESPONSE.applied,

			// ✅ Only adds schedule key if all conditions are met
			...(scheduleEnabled &&
				startUtc &&
				endUtc && {
					schedule: {
						start: formatISO(new Date(startUtc)),
						end: formatISO(new Date(endUtc)),
						day: format(new Date(startUtc), 'EEEE'),
						date: requestDate
					}
				})
		};

		//✅ You can now send the payload
		processResponse(payload, {
			onSuccess: () =>
				router.push(TECHNICIAN_ROUTES_DEFINITION.DASHBOARD.TICKETS)
		});
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

	function removeIndex(index: number) {
		// if (fields.length > 1) {
		// 	remove(index);
		// }
		remove(index);
	}

	return (
		<div className='flex  gap-6'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className='flex bg-card p-6 border rounded-xl w-2/3 flex-col gap-4'>
				<div className='flex flex-col gap-3'>
					<Label htmlFor='cost' className='px-1'>
						Cost
					</Label>

					<section className='border  rounded-lg p-4'>
						<h3 className='text-sm font-semibold mb-2'>
							Cost Breakdown
						</h3>
						{watchCosts.length === 0 && (
							<small>
								Add a breakdown of cost required to complete
								gig.
							</small>
						)}

						{fields.map((item, index) => (
							<div
								key={item.id}
								className='flex items-start gap-4 mb-2'>
								<Controller
									name={`quote.cost.${index}.title`}
									control={control}
									shouldUnregister={false}
									rules={{ required: 'Title is required' }}
									render={({ field, fieldState }) => (
										<div className='flex-1'>
											<Input
												type='text'
												placeholder='Title (e.g. Purchase of new items)'
												{...field}
											/>

											{fieldState.error && (
												<ErrorMessage
													errorMsg={
														fieldState.error
															.message ?? ''
													}
												/>
											)}
										</div>
									)}
								/>
								<Controller
									name={`quote.cost.${index}.amount`}
									control={control}
									rules={{
										required: 'Amount is required',
										min: {
											value: 0,
											message: 'Must be >= 0'
										}
									}}
									render={({ field, fieldState }) => (
										<div className='flex-1'>
											<Input
												type='number'
												step='0.01'
												placeholder='Amount'
												{...field}
											/>
											{fieldState.error && (
												<ErrorMessage
													errorMsg={
														fieldState.error
															.message ?? ''
													}
												/>
											)}
										</div>
									)}
								/>

								<button
									title='Remove cost item'
									type='button'
									onClick={() => {
										removeIndex(index);
									}}
									className='flex items-center  text-sm cursor-pointer font-bold'>
									<X strokeWidth={1} size={14} color='red' />
								</button>
							</div>
						))}
						<div className='flex mt-5 justify-end'>
							<ButtonComponent
								type='reset'
								handleClick={handleAddCost}
								styles='rounded-lg'
								beforeIcon={
									<CirclePlus size={14} strokeWidth={1} />
								}
								btnText={'Add Cost Item'}></ButtonComponent>
							{/* <button
								type='button'
								onClick={handleAddCost}
								className=' px-2 py-2 bg-blue-600 flex items-center gap-2 text-white text-sm rounded'>
								<CirclePlus size={14} strokeWidth={1} /> Add
								Cost Item
							</button> */}
						</div>
						{/* <div className='mt-4 font-semibold'>
							Total: {Number(totalCost).toLocaleString()} USD
						</div> */}
					</section>

					{/* <Controller
						control={control}
						rules={{ required: 'Please enter cost' }}
						name='quote.total'
						render={({ field }) => (
							<div className='relative w-full'>
								<Input
									{...field}
									value={field.value ?? ''}
									type='text'
									id='cost'
								/>
								<span className='absolute right-3 top-1/2 -translate-y-1/2  text-muted-foreground text-sm pointer-events-none'>
									USD
								</span>
							</div>
						)}
					/> */}
				</div>

				<div className='flex flex-col gap-3'>
					<Label htmlFor='message' className='px-1'>
						Message
					</Label>
					<Controller
						control={control}
						name='message'
						render={({ field }) => (
							<Textarea {...field} id='message' />
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
						// handleClick={() => onCloseModal?.()}
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

			<section className='w-1/3 bg-card border rounded-xl p-4 text-sm shadow-sm h-fit'>
				<h3 className='text-lg font-semibold mb-4'>Estimated Cost</h3>

				{watchCosts.length === 0 ? (
					<p className='text-gray-500'>No cost items added yet.</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow className='bg-muted rounded-lg'>
								<TableHead className='text-xs'>Item</TableHead>
								<TableHead className='text-right text-xs'>
									Amount (₦)
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{watchCosts.map((item, index) => (
								<TableRow key={index}>
									<TableCell className='truncate text-xs'>
										{item.title}
									</TableCell>
									<TableCell className='text-right text-xs'>
										{Number(
											item.amount || 0
										).toLocaleString()}
									</TableCell>
								</TableRow>
							))}

							<TableRow className='font-bold border-t'>
								<TableCell className='text-sm'>Total</TableCell>
								<TableCell className='text-right text-sm'>
									{totalCost.toLocaleString()}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				)}
			</section>
		</div>
	);
};

export default ApplyForm;
