'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiHomeLine } from 'react-icons/ri';
import { PiCaretDoubleRightThin } from 'react-icons/pi';

const hiddenSegments = new Set(['admin', 'technician']);

const segmentLabels: Record<string, string> = {
	chat: 'Chat',
	dashboard: 'Dashboard',
	properties: 'Properties',
	settings: 'Settings',
	users: 'Users',
	'ticket-management': 'Ticket Management',
};

function labelForSegment(segment: string) {
	const decoded = decodeURIComponent(segment);
	return (
		segmentLabels[decoded] ||
		decoded
			.split('-')
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ')
	);
}

export default function Breadcrumbs() {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);

	const pathLinks = segments
		.map((seg, index) => {
			const href = '/' + segments.slice(0, index + 1).join('/');
			const label = labelForSegment(seg);
			const hide = hiddenSegments.has(seg);
			return { href, label, hide };
		})
		.filter((crumb) => !crumb.hide);

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
							<span className='font-medium'>
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
				))}
			</ol>
		</nav>
	);
}
