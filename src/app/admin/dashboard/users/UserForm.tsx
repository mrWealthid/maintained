'use client';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUser } from './hooks/userHooks';
import TextInput from '@/shared/components/form-elements/Text-Input';
import EmailInput from '@/shared/components/form-elements/Email-Input';
import ButtonComponent from '@/shared/components/form-elements/Button';
import { ROLES } from '@/shared/enums/enums';
import { ManageUserForm, ManageUserFormProps } from '@/shared/model/model';

const UserForm: FC<ManageUserFormProps> = ({ user, onCloseModal }) => {
	const isEditing = !!user?._id;

	const { register, handleSubmit, formState } = useForm<ManageUserForm>({
		mode: 'all',
		defaultValues: isEditing ? { ...user } : {}
	});

	const { errors, isSubmitting, isValid, isDirty } = formState;
	const { isCreating, createUser } = useCreateUser(
		isEditing,
		onCloseModal,
		user?.id
	);

	async function onSubmit(data: ManageUserForm) {
		createUser(data);
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
							name={'name'}
							label='Enter Name'
							error={errors?.['name']?.message?.toString()}>
							<input
								{...register('name', {
									required: 'This field is required'
								})}
								className='input-style'
								type='text'
								id='name'
								placeholder='Enter Full Name'
							/>
						</TextInput>
					</div>
					<div className='w-full flex gap-4'>
						<EmailInput
							name={'email'}
							label='Email'
							error={errors?.['email']?.message?.toString()}>
							<input
								{...register('email', {
									required: 'This field is required',
									pattern: {
										value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
										message: 'Invalid email address'
									}
								})}
								className='input-style  '
								type='email'
								id='email'
								placeholder='johndoe@gmail.com'
							/>
						</EmailInput>
					</div>

					<div className='w-full flex gap-4'>
						<TextInput
							name={'role'}
							label='Role'
							required={true}
							error={errors?.['role']?.message?.toString()}>
							<select
								className='input-style cursor-pointer'
								{...register('role', {
									required: 'This field is required'
								})}>
								<option value=''>Select Role</option>
								<option> {ROLES.user}</option>
								<option> {ROLES.admin}</option>
								<option> {ROLES.technician}</option>
							</select>
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
							loading={isCreating}
							btnText={` ${
								isEditing ? 'Update User' : ' Create User'
							}`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default UserForm;
