import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRegister from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'HFausto Tracker | Command Center Health',
  description: 'Command Center Health PWA — Xiaomi Mi Body Composition Scale S400 tracker.',
  applicationName: 'HFausto Tracker',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F5F7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-apple-bg antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
