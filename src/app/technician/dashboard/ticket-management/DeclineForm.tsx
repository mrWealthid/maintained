'use client';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import TextInput from '@/shared/components/form-elements/Text-Input';
import ButtonComponent from '@/shared/components/form-elements/Button';
import { TECHNICIAN_RESPONSE } from '@/shared/enums/enums';
import { useProcessTechnicianResponse } from '@/shared/ticket-feat/hooks/ticketHooks';
import { DeclineTicketFormProps } from '@/shared/ticket-feat/model/ticket.model';

const DeclineForm: FC<DeclineTicketFormProps> = ({ ticket, onCloseModal }) => {
	const { register, handleSubmit, formState } = useForm<{ reason: string }>({
		mode: 'all'
	});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isProcessing, processResponse } = useProcessTechnicianResponse(
		ticket.id,
		onCloseModal
	);

	async function onSubmit(data: { reason: string }) {
		const payload = { response: TECHNICIAN_RESPONSE.declined, ...data };
		processResponse(payload);
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
					<div className='w-full flex gap-4'>
						<TextInput
							name={'reason'}
							placeholder='Kindly describe'
							label='reason'
							required={true}
							error={errors?.['reason']?.message?.toString()}>
							<textarea
								className='input-style'
								{...register('reason', {
									required: 'This field is required'
								})}
								disabled={isSubmitting}
								id='reason'
								cols={40}
								rows={4}></textarea>
						</TextInput>
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
							loading={isProcessing}
							btnText={`Submit
							`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default DeclineForm;
