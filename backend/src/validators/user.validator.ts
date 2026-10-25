import { z } from 'zod';
import { paginationFields } from '../utils/pagination';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name cannot be empty').max(100).optional(),
    college: z.string().trim().max(150).nullable().optional(),
    major: z.string().trim().max(100).nullable().optional(),
    interestedIn: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    github: z.string().trim().max(200).nullable().optional(),
    linkedin: z.string().trim().max(200).nullable().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Provide at least one field to update',
  });
  export const replaceSkillsSchema = z
  .object({
    skillIds: z.array(z.string().uuid('Each skill id must be a valid UUID')).max(30),
  })
  .strict();
  export const updateContactSchema = z
  .object({
    contactEmail: z.string().trim().email('Valid contact email required').nullable().optional(),
    discord: z.string().trim().min(2).max(100).nullable().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9\s\-()]{7,20}$/, 'Phone must be 7-20 characters: digits, +, -, spaces, ()')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Provide at least one field to update',
  });
  

export const searchTalentQuerySchema = z
  .object({
    ...paginationFields,
    skillIds: z
      .string()
      .transform((s) => s.split(',').map((id) => id.trim()).filter(Boolean))
      .pipe(z.array(z.string().uuid('Each skill id must be a valid UUID')).min(1).max(10))
      .optional(),
    skillMatch: z.enum(['any', 'all']).default('any'),
    major: z.string().trim().min(1, 'major cannot be empty').max(100).optional(),
    college: z.string().trim().min(1, 'college cannot be empty').max(150).optional(),
    q: z.string().trim().min(1, 'q cannot be empty').max(100).optional(),
  })
  .strict();
  export const userIdParamSchema = z.object({
    userId: z.string().uuid('userId must be a valid UUID'),
  });