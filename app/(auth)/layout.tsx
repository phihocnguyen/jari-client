import type { Metadata } from 'next';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: { default: 'Sign In', template: '%s | Jari' },
};

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-canvas-warm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        {children}
      </main>
      <ToastContainer />
    </>
  );
}
