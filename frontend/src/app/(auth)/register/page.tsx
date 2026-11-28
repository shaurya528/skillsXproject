import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFormSkeleton } from '@/features/auth/components/auth-form-skeleton';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Create account' };

type SearchParams = Promise<{ next?: string | string[] }>;

async function RegisterFormWithNext({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return <RegisterForm next={Array.isArray(next) ? next[0] : next} />;
}

export default function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Showcase your skills and join projects that need them.
      </p>
      <div className="mt-6">
        <Suspense fallback={<AuthFormSkeleton fields={3} />}>
          <RegisterFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
