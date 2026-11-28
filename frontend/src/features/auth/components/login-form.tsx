'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { signIn } from '@/features/auth/api';
import { getSafeNext } from '@/features/auth/next-url';
import { loginSchema, type LoginValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

export function LoginForm({ next }: { next?: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await signIn(values);
      setRedirecting(true);
      // A full page load, so the next page starts fresh with the new cookies
      window.location.assign(getSafeNext(next));
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      );
    }
  }

  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert message={formError} />
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting || redirecting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New here?{' '}
        <Link href={registerHref} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
