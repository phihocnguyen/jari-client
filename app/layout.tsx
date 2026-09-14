import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Jari — Project Management', template: '%s | Jari' },
  description: 'Jari is a powerful project management tool inspired by Jira. Manage sprints, issues, and team collaboration in one place.',
  keywords: ['project management', 'issue tracker', 'scrum', 'kanban', 'sprint'],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
