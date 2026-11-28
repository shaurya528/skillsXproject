import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-display text-3xl font-bold text-primary">
        {APP_NAME}
      </Link>
      <main className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {children}
      </main>
      <p className="mt-6 text-sm text-ink-muted">Find teammates. Build together.</p>
    </div>
  );
}
