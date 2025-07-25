'use client';
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { useAssignTechnician } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import {
	AssignTechnicianFormControls,
	AssignTechnicianFormProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import AutoComplete from '@/app/shared/components/auto-complete/AutoComplete';
import { Ticket, User } from '@/app/shared/model/model';
import { fetchTechnicians } from '@/app/shared/ticket-feat/service/ticket-service';

const AssignTechnicianForm: FC<AssignTechnicianFormProps> = ({
	ticket,
	onCloseModal
}) => {
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		assignedTo: User;
	} | null>(null);

	const { register, handleSubmit, setValue, formState } =
		useForm<AssignTechnicianFormControls>({
			mode: 'all'
		});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isAssigning, handleAssignTechnician } = useAssignTechnician(
		ticket.id,
		onCloseModal
	);

	async function onSubmit(data: AssignTechnicianFormControls) {
		handleAssignTechnician(data);
	}

	function onError(err: unknown) {
		console.log(err);
	}

	function handleAutoCompleteValues(values: any) {
		setAutoCompleteValue({ ...autoCompleteValue, ...values });
		if (values.assignedTo)
			setValue('assignedTo', values.assignedTo.id, {
				shouldValidate: true,
				shouldDirty: true
			});
	}

	return (
		<div className='w-full'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<div className='w-full flex gap-4'>
						<AutoComplete<User>
							queryKey='assignedTo'
							service={fetchTechnicians}
							label={'Technician'}
							optionKey={'id'}
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
							loading={isAssigning}
							btnText={`Submit
							`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default AssignTechnicianForm;
