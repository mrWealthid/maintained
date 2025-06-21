'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { CrumbLabelMap } from '../../model/model';
import { RiHomeLine } from 'react-icons/ri';

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
		<nav aria-label='breadcrumb' className='text-sm text-gray-600 mb-4'>
			<ol className='flex items-center space-x-1'>
				<li className='flex gap-1 items-center'>
					<RiHomeLine />
					<Link href='/' className='hover:underline text-blue-600'>
						Home
					</Link>
				</li>
				{pathLinks.map((crumb, idx) => (
					<Fragment key={crumb.href}>
						<span className='mx-1'>/</span>
						<li>
							{idx === pathLinks.length - 1 ? (
								<span className='font-medium text-gray-800'>
									{crumb.label}
								</span>
							) : (
								<Link
									href={crumb.href}
									className='hover:underline text-blue-600'>
									{crumb.label}
								</Link>
							)}
						</li>
					</Fragment>
				))}
			</ol>
		</nav>
	);
}
