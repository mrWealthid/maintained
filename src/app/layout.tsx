import type { Metadata } from 'next';
import {
	Quicksand,
	Merriweather,
	JetBrains_Mono,
	Sora
} from 'next/font/google';
import './global.css';
import Provider from '@/utils/Provider';
import { Toaster as Toasts } from '@/components/ui/sonner';
import { ThemeProvider } from '../shared/contexts/ThemeProvider';

const fontSans = Quicksand({
	subsets: ['latin'],
	variable: '--font-quicksand',
	display: 'swap'
});

const fontSerif = Merriweather({
	subsets: ['latin'],
	weight: ['300', '400', '700', '900'],
	variable: '--font-merriweather',
	display: 'swap'
});

const fontMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono',
	display: 'swap'
});

const fontDisplay = Sora({
	subsets: ['latin'],
	variable: '--font-sora',
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Properly',
	description: 'Automate Maintenance Today!'
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} ${fontDisplay.variable}`}
			suppressHydrationWarning>
			<body className='font-sans antialiased'>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange>
					<Toasts position='bottom-center' />

					<Provider>{children}</Provider>
				</ThemeProvider>
			</body>
		</html>
	);
}
