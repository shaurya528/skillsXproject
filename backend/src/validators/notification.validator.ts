import { z } from 'zod';
import { NOTIFICATION_TYPES } from '../types';
import { paginationFields } from '../utils/pagination';

export const listNotificationsQuerySchema = z
  .object({
    ...paginationFields,
    isRead: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    type: z.enum(NOTIFICATION_TYPES).optional(),
  })
  .strict();

export const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid('notificationId must be a valid UUID'),
});

export const markNotificationSchema = z
  .object({ isRead: z.boolean() })
  .strict();

export const markManyNotificationsSchema = z
  .object({
    ids: z.array(z.string().uuid('Each id must be a valid UUID')).min(1).max(100).optional(),
    all: z.literal(true).optional(),
    isRead: z.boolean(),
  })
  .strict()
  .refine((obj) => (obj.ids !== undefined) !== (obj.all === true), {
    message: 'Provide either ids or all: true, but not both',
  });