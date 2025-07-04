'use client';

import { motion } from 'framer-motion';

export default function AnimatedBorderWrapper({
	children,
	loading = false
}: {
	children: React.ReactNode;
	loading?: boolean;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6, ease: 'easeInOut' }}
			className='relative p-[2px] rounded-xl overflow-hidden'>
			{/* ✅ Only render the animated border when loading */}
			{loading && (
				<motion.div
					className='absolute inset-0 rounded-xl z-0 pointer-events-none'
					animate={{
						backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
					}}
					transition={{
						duration: 6,
						ease: 'linear',
						repeat: Infinity
					}}
					style={{
						background:
							'linear-gradient(270deg, #8b5cf6, #14b8a6, #ec4899, #8b5cf6)',
						backgroundSize: '400% 400%'
					}}
				/>
			)}

			<div className='relative z-10 bg-background rounded-xl'>
				{children}
			</div>
		</motion.div>
	);
}
