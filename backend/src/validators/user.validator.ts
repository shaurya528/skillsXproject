import { z } from 'zod';

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