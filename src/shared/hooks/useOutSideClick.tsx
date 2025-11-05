"use client";
// import { useEffect, useRef } from 'react';

// export const useOutsideClick = (handler: any, listenCapturing = true) => {
// 	const ref = useRef<any>();

// 	useEffect(() => {
// 		function handleClick(e: any) {
// 			if (e.target.classList.contains('backdrop')) {
// 				handler();

// 				console.log('click out');
// 			}

// 			// This didn't work can not debug yet
// 			// if (ref.current && !ref.current.contains(e.target)) {
// 			// 	console.log('got here');

// 			// 	handler();
// 			// }
// 		}

// 		document.addEventListener('click', handleClick, listenCapturing);
// 		return () =>
// 			document.removeEventListener('click', handleClick, listenCapturing);
// 	}, [handler, listenCapturing, ref]);

// 	return ref;
// };

import { useEffect } from "react";

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  closeOnOutsideClick: boolean = false
) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!closeOnOutsideClick) return;

      // If ref doesn't exist or click is inside the ref, ignore
      if (!ref.current || ref.current.contains(target)) return;

      // Check if the click is inside a Radix UI dropdown/popover portal
      const isInRadixPopover = target.closest(
        "[data-radix-popper-content-wrapper]"
      );

      if (isInRadixPopover) return;

      handler(); // Only trigger outside handler if NOT in portal
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, handler, closeOnOutsideClick]);
}
