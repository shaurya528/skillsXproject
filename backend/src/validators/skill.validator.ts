import { z } from 'zod';

export const listSkillsQuerySchema = z
  .object({
    category: z.string().trim().min(1, 'category cannot be empty').max(50).optional(),
    q: z.string().trim().min(1, 'q cannot be empty').max(50).optional(),
  })
  .strict();