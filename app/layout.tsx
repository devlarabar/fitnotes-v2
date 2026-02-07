import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './components/providers';

export const metadata: Metadata = {
  title: 'FitNotes',
  description: 'Track your workouts with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
