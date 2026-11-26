import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import { APP_NAME } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: 'Find teammates and projects that match your skills.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
