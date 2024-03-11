'use client';

import TextInput from '@/components/shared/Form-inputs/Text-Input';
import ButtonComponent from '@/components/shared/Form-inputs/Button';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AutoComplete from '@/components/shared/AutoComplete/AutoComplete';

import {
	addDays,
	differenceInDays,
	formatISO,
	startOfDay,
	endOfDay,
	parseISO
} from 'date-fns';

import { useCreateMaintenanceRequest } from './hooks/maintenanceHooks';

const MaintenanceForm = ({ booking, onCloseModal, settings }: any) => {
	const isEditing = !!booking?.id;
	const [autoCompleteValue, setAutoCompleteValue] = useState<{
		guests: any;
		cabin: any;
	} | null>(null);

	const { register, handleSubmit, getValues, formState } = useForm({
		mode: 'all',
		defaultValues: isEditing ? { ...booking } : {},
		values: {
			cabin: autoCompleteValue?.cabin?.id,
			guests: autoCompleteValue?.guests?.id
		}
	});

	const { errors, isSubmitting } = formState;
	const { isCreating, createMaintenance } = useCreateMaintenanceRequest(
		booking?.id,
		isEditing,
		onCloseModal
	);

	function handleAutoCompleteValues(values: any) {
		setAutoCompleteValue({ ...autoCompleteValue, ...values });
	}

	async function onSubmit(data: any) {
		const { cabin }: any = autoCompleteValue;

		const payload = {
			...data,
			discount: cabin.discount,
			cabinPrice: cabin.regularPrice
		};

		console.log(payload);

		createMaintenance(payload);
	}

	function onError(err: any) {
		console.log(err);
	}

	return (
		<div className='w-full rounded-lg  bg-white'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 p-1 sm:p-6   items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<TextInput
						name={'title'}
						placeholder='Enter Title'
						label='Title'
						error={errors?.['title']?.message?.toString()}>
						<input
							{...register('title', {
								required: 'This field is required'
							})}
							className='input-style'
							type='text'
							disabled={isSubmitting}
							id='title'
						/>
					</TextInput>

					<TextInput
						name={'description'}
						placeholder='Kindly describe'
						label='Description'
						error={errors?.['description']?.message?.toString()}>
						<textarea
							className='input-style'
							{...register('description', {
								required: 'This field is required'
							})}
							disabled={isSubmitting}
							id='description'
							cols={40}
							rows={8}></textarea>
					</TextInput>

					<AutoComplete
						queryKey='category'
						// service={fetchCabins}
						label={'Category'}
						// custom={'regularPrice'}
						displayValue={'name'}
						handler={handleAutoCompleteValues}
					/>
					<div className='hidden'>
						<TextInput
							name={'category'}
							error={errors?.['category']?.message?.toString()}>
							<input
								title='category'
								{...register('category', {
									required: 'This field is required'
								})}
								className='input-style'
								type='text'
								hidden
								readOnly
								id='category'
							/>
						</TextInput>
					</div>

					<section className='flex items-center gap-2'>
						<TextInput
							name={'regularPrice'}
							placeholder='Enter regularPrice'
							label='Regular Price'
							error={errors?.[
								'regularPrice'
							]?.message?.toString()}>
							<input
								title='regularPrice'
								// {...register('regularPrice', {
								// 	required: 'This field is required'
								// })}
								value={
									autoCompleteValue?.cabin?.regularPrice || ''
								}
								readOnly
								className='input-style'
								type='text'
								id='regularPrice'
							/>
						</TextInput>
						<TextInput
							name={'discount'}
							placeholder='Enter discount'
							label='Discount'
							error={errors?.['discount']?.message?.toString()}>
							<input
								title='discount'
								// {...register('discount', {
								// 	required: 'This field is required'
								// })}
								value={autoCompleteValue?.cabin?.discount || ''}
								className='input-style'
								type='number'
								readOnly
								id='discount'
							/>
						</TextInput>
					</section>

					{/* {formState.isValid && (
						<section className=' text-xs dark:text-white  items-center flex gap-2  mt-1'>
							<input
								title='check'
								id='checkbox-all-search'
								type='checkbox'
								checked={hasBreakfast}
								onChange={addBreakfast}
								className='w-4 h-4 m-0 border-gray-300 rounded focus:ring-gray-500 '
							/>
							<label
								htmlFor='checkbox-all-search text-sm'
								className='sr-only'>
								#
							</label>

							<span>
								Want to add breakfast
								<span>
									{' '}
									for{' '}
									{formState.isValid &&
										formatCurrency(breakfastPrice)}
									?
								</span>
							</span>
						</section>
					)} */}

					<section className='flex justify-end gap-4'>
						<ButtonComponent
							type='reset'
							handleClick={() => onCloseModal?.()}
							styles='rounded-3xl'
							btnText={'Cancel'}></ButtonComponent>

						<ButtonComponent
							type='submit'
							styles='rounded-3xl'
							disabled={!formState.isValid || isSubmitting}
							loading={isCreating}
							btnText={` ${
								isEditing ? 'Update Request' : ' Submit Request'
							}`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default MaintenanceForm;
