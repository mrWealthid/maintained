import {
	BetweenVerticalStart,
	Cog,
	Cuboid,
	GalleryVerticalEnd,
	Settings,
	SquareStack,
	Warehouse
} from 'lucide-react';
import Image from 'next/image';

export default function AuthWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='min-h-screen justify-center  items-center flex'>
			<div className='grid   w-5/6 border lg:grid-cols-2'>
				<div className='flex bg-card flex-col gap-4 p-6 md:p-10'>
					<div className='flex justify-center gap-2 md:justify-start'>
						<a
							href='#'
							className='flex items-center gap-3 font-medium'>
							<div className='bg-primary flex  text-primary-foreground  items-center justify-center rounded-md'>
								<Warehouse
									className='size-3'
									color='#1849aa'
									strokeWidth={2}
								/>
							</div>
							Maintainly
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
