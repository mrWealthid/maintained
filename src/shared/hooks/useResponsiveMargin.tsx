import { useEffect, useState } from 'react';

export function useResponsiveSidebarMargin(isCollapsed: boolean) {
	const [marginLeft, setMarginLeft] = useState(256);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 640px)'); // sm breakpoint

		const computeMargin = () => {
			if (mediaQuery.matches) {
				setMarginLeft(isCollapsed ? 65 : 256); // in px
			} else {
				setMarginLeft(0); // no margin on mobile
			}
		};

		computeMargin(); // initial
		mediaQuery.addEventListener('change', computeMargin);

		return () => {
			mediaQuery.removeEventListener('change', computeMargin);
		};
	}, [isCollapsed]);

	return marginLeft;
}
