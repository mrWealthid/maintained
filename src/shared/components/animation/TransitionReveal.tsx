'use client';
import { AnimatePresence, motion } from 'framer-motion';

const TransitionReveal = ({
	children,
	keyId
}: {
	children: React.ReactNode;
	keyId: string;
}) => {
	return (
		<AnimatePresence mode='wait'>
			<motion.div
				key={keyId}
				initial={{ opacity: 0, x: 100 }} // ➡️ slide from right
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -100 }} // ⬅️ slide out to left
				transition={{ duration: 0.3 }}>
				{children}
			</motion.div>
		</AnimatePresence>
	);
};

export default TransitionReveal;
