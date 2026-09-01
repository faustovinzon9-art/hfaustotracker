import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HFausto Tracker | Command Center Health',
  description: 'Command Center Health PWA — Xiaomi Mi Body Composition Scale S400 tracker.',
  applicationName: 'HFausto Tracker',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F5F7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-apple-bg antialiased">
        {children}
      </body>
    </html>
  );
}
