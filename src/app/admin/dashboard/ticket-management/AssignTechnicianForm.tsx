'use client';
import React, { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import {

	useFetchTechnicians,
	useSendTechnicianRequest
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	AssignTechnicianFormControls,
	AssignTechnicianFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import AutoComplete from '@/app/shared/components/auto-complete/AutoComplete';
import { Ticket, User } from '@/app/shared/model/model';
import MultiSelectCombobox from '@/app/shared/components/auto-complete/MultipleSelect';
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

const AssignTechnicianForm: FC<AssignTechnicianFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		assignedTo: User;
	} | null>(null);

	const { register, handleSubmit, control, setValue, formState } =
		useForm<AssignTechnicianFormControls>({
			mode: 'all',
			defaultValues: { technicianIds: [] }
		});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isSending, handleSendTechnicianRequest } = useSendTechnicianRequest(
		ticket._id,
		onCloseModal
	);

	const { data: technicians } = useFetchTechnicians<User>();

	async function onSubmit(data: AssignTechnicianFormControls) {
		handleSendTechnicianRequest(data);
	}

	function onError(err: unknown) {
		console.log(err);
	}

	// function handleAutoCompleteValues(values: any) {
	// 	setAutoCompleteValue({ ...autoCompleteValue, ...values });
	// 	if (values.assignedTo)
	// 		setValue('assignedTo', values.assignedTo._id, {
	// 			shouldValidate: true,
	// 			shouldDirty: true
	// 		});
	// }

	return (
		<div className='w-full'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 items-center'>
				<section className='flex-col flex gap-2 w-full'>
					{/* <div className='w-full flex gap-4'>
						<AutoComplete<User>
							queryKey='assignedTo'
							service={fetchTechnicians}
							label={'Technician'}
							optionKey={'_id'}
							displayValue={'name'}
							initialValue={ticket?.assignedTo}
							handler={handleAutoCompleteValues}
						/>

						<div className='hidden'>
							<TextInput
								name={'assignedTo'}
								error={errors?.[
									'assignedTo'
								]?.message?.toString()}>
								<input
									title='assignedTo'
									{...register('assignedTo', {
										required: 'This field is required'
									})}
									className='input-style'
									type='text'
									id='assignedTo'
								/>
							</TextInput>
						</div>
					</div> */}

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

export default AssignTechnicianForm;
