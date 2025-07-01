'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { CrumbLabelMap } from '../../model/model';
import { RiHomeLine } from 'react-icons/ri';
import { PiCaretDoubleRightThin } from 'react-icons/pi';

interface BreadcrumbsProps {
	crumbLabelMap: CrumbLabelMap;
}

export default function Breadcrumbs({ crumbLabelMap }: BreadcrumbsProps) {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);

	const pathLinks = segments
		.map((seg, index) => {
			const href = '/' + segments.slice(0, index + 1).join('/');
			const entry = crumbLabelMap[seg];
			const label = entry?.label || decodeURIComponent(seg);
			const hide = entry?.hide;
			return { href, label, hide };
		})
		.filter((crumb) => !crumb.hide); // 👈 exclude hidden segments

	return (
		<nav aria-label='breadcrumb' className='text-sm sm:text-xs    mb-4'>
			<ol className='flex items-center flex-wrap space-x-1'>
				<li className='flex gap-1 items-center'>
					<RiHomeLine />
					<Link href='/' className='hover:underline text-blue-600'>
						Home
					</Link>
				</li>
				{pathLinks.map((crumb, idx) => (
					<li key={crumb.href} className='flex items-center gap-1'>
						<span className='mx-1'>
							<PiCaretDoubleRightThin />
						</span>
						{idx === pathLinks.length - 1 ? (
							<span className='font-medium capitalize '>
								{crumb.label}
							</span>
						) : (
							<Link
								href={crumb.href}
								className='hover:underline capitalize text-blue-600'>
								{crumb.label}
							</Link>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
