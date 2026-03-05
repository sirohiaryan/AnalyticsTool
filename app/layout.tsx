import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { SettingsProvider } from '@/components/providers/SettingsProvider';

export const metadata: Metadata = {
  title: 'Creator Analytics',
  description: 'Serialized audio creator analytics dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-accent="purple">
      <body>
        <SettingsProvider>
          <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
            <Sidebar />
            <main className="p-5 md:p-8">{children}</main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
