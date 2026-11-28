'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { signUp } from '@/features/auth/api';
import { getSafeNext } from '@/features/auth/next-url';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

export function RegisterForm({ next }: { next?: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const result = await signUp(values);
      setRedirecting(true);
      window.location.assign(result.loggedIn ? getSafeNext(next) : '/login');
    } catch (error) {
      // 409 means this email already has an account: show it on the email field
      if (error instanceof ApiError && error.status === 409) {
        setError('email', { message: 'This email is already registered. Try logging in instead.' });
        return;
      }
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      );
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert message={formError} />
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting || redirecting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
