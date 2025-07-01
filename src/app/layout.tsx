import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './global.css';
import Provider from '@/utils/Provider';
import { Toaster } from 'react-hot-toast';

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
			<body className={`${raleway.className} `}>
				<Provider>{children}</Provider>

				<Toaster
					position='bottom-center'
					gutter={12}
					containerStyle={{ margin: '8px' }}
					toastOptions={{
						success: { duration: 3000 },
						error: { duration: 4000 },
						style: {
							fontSize: '14px',
							maxWidth: '500px',
							padding: '16px 24px'
						}
					}}
				/>
			</body>
		</html>
	);
}
