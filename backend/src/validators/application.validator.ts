import { z } from 'zod';
import { APPLICATION_STATUSES } from '../types';
import { paginationFields } from '../utils/pagination';

export const submitApplicationSchema = z
  .object({
    message: z.string().trim().max(1000, 'Message is too long (max 1000 characters)').optional(),
  })
  .strict()
  .default({});

export const applicationIdParamSchema = z.object({
  applicationId: z.string().uuid('applicationId must be a valid UUID'),
});


export const decideApplicationSchema = z
  .object({
    status: z.enum(['accepted', 'rejected', 'withdrawn']),
  })
  .strict();

export const listApplicationsQuerySchema = z
  .object({
    ...paginationFields,
    status: z.enum(APPLICATION_STATUSES).optional(),
  })
  .strict();