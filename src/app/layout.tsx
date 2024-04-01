import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './global.css';
import Provider from '@/utils/Provider';

const raleway = Raleway({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Maintainly',
	description: 'Automate Maintenance Today!'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${raleway.className}  dark:bg-[#192734] bg-[#eceef1]`}>
				<Provider>{children}</Provider>
			</body>
		</html>
	);
}
