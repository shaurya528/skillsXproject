import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email').email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100, 'Name is too long'),
  email,
  password: z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters'),
});
export type RegisterValues = z.infer<typeof registerSchema>;
