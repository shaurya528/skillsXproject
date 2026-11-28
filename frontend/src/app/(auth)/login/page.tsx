import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFormSkeleton } from '@/features/auth/components/auth-form-skeleton';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Log in' };

type SearchParams = Promise<{ next?: string | string[] }>;

// Reads the address inside Suspense, so the rest of the page can load at once
async function LoginFormWithNext({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return <LoginForm next={Array.isArray(next) ? next[0] : next} />;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Log in to find teammates and projects.</p>
      <div className="mt-6">
        <Suspense fallback={<AuthFormSkeleton fields={2} />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
