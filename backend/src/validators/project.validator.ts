import { z } from 'zod';
import { STAGES ,PROJECT_STATUSES} from '../types';


export const createProjectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(150),
    description: z.string().trim().max(2000).optional(),
    domain: z.string().trim().min(1).max(100).optional(),
    stage: z.enum(STAGES).optional(),
    maxTeamSize: z.number().int().min(2, 'maxTeamSize must be at least 2').max(20).optional(),
    githubUrl: z.string().trim().url('githubUrl must be a valid URL').max(300).optional(),
    requiredSkillIds: z
      .array(z.string().uuid('Each skill id must be a valid UUID'))
      .max(15)
      .optional(),
  })
  .strict();

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
});
export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    domain: z.string().trim().min(1).max(100).nullable().optional(),
    stage: z.enum(STAGES).optional(),
    maxTeamSize: z.number().int().min(2, 'maxTeamSize must be at least 2').max(20).optional(),
    githubUrl: z.string().trim().url('githubUrl must be a valid URL').max(300).nullable().optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Provide at least one field to update',
  });

export const replaceRequiredSkillsSchema = z
  .object({
    skillIds: z.array(z.string().uuid('Each skill id must be a valid UUID')).max(15),
  })
  .strict();
  

export const changeStatusSchema = z
  .object({
    status: z.enum(PROJECT_STATUSES),
  })
  .strict();
  import { paginationFields } from '../utils/pagination';

export const searchProjectsQuerySchema = z
  .object({
    ...paginationFields,
    skillIds: z
      .string()
      .transform((s) => s.split(',').map((id) => id.trim()).filter(Boolean))
      .pipe(z.array(z.string().uuid('Each skill id must be a valid UUID')).min(1).max(10))
      .optional(),
    skillMatch: z.enum(['any', 'all']).default('any'),
    domain: z.string().trim().min(1, 'domain cannot be empty').max(100).optional(),
    stage: z.enum(STAGES).optional(),
    q: z.string().trim().min(1, 'q cannot be empty').max(100).optional(),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  })
  .strict();