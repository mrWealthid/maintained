import { GalleryVerticalEnd } from 'lucide-react';
import Image from 'next/image';

export default function AuthWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='min-h-screen justify-center  items-center flex'>
			<div className='grid  w-5/6 border lg:grid-cols-2'>
				<div className='flex flex-col gap-4 p-6 md:p-10'>
					<div className='flex justify-center gap-2 md:justify-start'>
						<a
							href='#'
							className='flex items-center gap-2 font-medium'>
							<div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
								<GalleryVerticalEnd className='size-4' />
							</div>
							Acme Inc.
						</a>
					</div>
					<div className='flex flex-1 items-center justify-center'>
						<div className='w-full'>{children}</div>
					</div>
				</div>
				<div className=' relative hidden lg:block'>
					<Image
						width={100}
						height={100}
						src='https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg'
						alt='Image'
						className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
					/>
				</div>
			</div>
		</div>
	);
}
