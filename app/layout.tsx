import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const geistSans = Geist({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Jari — Project Management', template: '%s | Jari' },
  description: 'Jari is a powerful project management tool inspired by Jira. Manage sprints, issues, and team collaboration in one place.',
  keywords: ['project management', 'issue tracker', 'scrum', 'kanban', 'sprint'],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
