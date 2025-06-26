// 'use client';

// import { motion } from 'framer-motion';

// export default function AnimatedBorderWrapper({
// 	children
// }: {
// 	children: React.ReactNode;
// }) {
// 	return (
// 		<motion.div
// 			initial={{ opacity: 0 }}
// 			animate={{ opacity: 1 }}
// 			exit={{ opacity: 0 }}
// 			transition={{ duration: 0.4 }}
// 			className='relative p-[2px] rounded-xl overflow-hidden'>
// 			<motion.div
// 				className='absolute inset-0 rounded-xl z-0'
// 				animate={{
// 					backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
// 				}}
// 				transition={{
// 					duration: 6,
// 					ease: 'linear',
// 					repeat: Infinity
// 				}}
// 				style={{
// 					background:
// 						'linear-gradient(270deg, #ec4899, #f59e0b, #3b82f6, #10b981, #ec4899)',
// 					backgroundSize: '400% 400%'
// 				}}
// 			/>
// 			<div className='relative z-10 bg-white dark:bg-gray-900 rounded-xl'>
// 				{children}
// 			</div>
// 		</motion.div>
// 	);
// }

'use client';

import { motion } from 'framer-motion';

export default function AnimatedBorderWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6, ease: 'easeInOut' }}
			className='relative p-[2px] rounded-xl overflow-hidden'>
			{/* 🔥 Glowing animated border */}
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

			{/* 🧊 Clean card content with white border mask */}
			<div className='relative z-10 rounded-xl bg-white dark:bg-gray-900 p-4'>
				{children}
			</div>
		</motion.div>
	);
}
