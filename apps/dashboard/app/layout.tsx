import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../src/components/Providers';

export const metadata: Metadata = {
	title: 'CryptoSense Dashboard',
	description: 'Generated dynamically via Turborepo architecture',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className="dark" lang="en">
			<body className="bg-base text-primary">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
