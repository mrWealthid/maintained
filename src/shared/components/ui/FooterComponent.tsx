import React from 'react';
import Reveal from '../animation/Reveal';
import TextInput from '../form-elements/Text-Input';
import EmailInput from '../form-elements/Email-Input';
import ButtonComponent from '../form-elements/Button';

const FooterComponent = () => {
	return (
		<footer className=' flex text-secondary flex-col '>
			<section className=' background py-10 md:py-12 flex flex-col text-center items-center gap-3 justify-center container-text '>
				<Reveal
					width='100%'
					variant={{
						hidden: { opacity: 0, y: 75 },
						visible: { opacity: 1, y: 0 }
					}}>
					<h3 className='text-4xl font-bold  '>Be Born Again</h3>
				</Reveal>
				<p className='text-xl font-semibold'>SAY THESE WORDS:</p>
				<Reveal
					variant={{
						hidden: { opacity: 0, x: 75 },
						visible: { opacity: 1, x: 0 }
					}}>
					<p className='md:max-w-2xl text- font-light 2xl:max-w-2xl'>
						Lorem ipsum dolor, sit amet consectetur adipisicing
						elit. Ut tenetur itaque, eum iure a, veritatis ipsa
						placeat enim vel voluptatem tempore id dolore officia.
						Eum, magnam cum! Perferendis, distinctio laborum?
						tenetur itaque, eum iure a, veritatis ipsa placeat enim
						vel voluptatem tempore id dolore officia. Eum, magnam
						cum! Perferendis, distinctio laborum?
					</p>
				</Reveal>

				<form
					className=' w-full md:w-1/2 flex flex-col gap-3 '
					action='
        '>
					<TextInput
						name={'FullName'}
						placeholder={'Enter Full Name'}
					/>

					<section className='flex w-full gap-3'>
						<EmailInput name={'email'} />

						<TextInput
							name={'Phone'}
							placeholder={'Enter Phone Number'}
						/>
					</section>

					<section className=' flex justify-end '>
						<ButtonComponent
							styles='rounded-3xl !w-1/3 2xl:w-1/5'
							btnText='Submit'
							type='submit'
							afterIcon='/assets/send.svg'
						/>
					</section>
				</form>
			</section>
		</footer>
	);
};

export default FooterComponent;
