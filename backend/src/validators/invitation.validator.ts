import { z } from 'zod';
import { INVITATION_STATUSES } from '../types';
import { paginationFields } from '../utils/pagination';

export const sendInvitationSchema = z
  .object({
    inviteeId: z.string().uuid('inviteeId must be a valid UUID'),
    message: z.string().trim().max(1000, 'Message is too long (max 1000 characters)').optional(),
  })
  .strict();

export const listInvitationsQuerySchema = z
  .object({
    ...paginationFields,
    status: z.enum(INVITATION_STATUSES).optional(),
  })
  .strict();

export const invitationIdParamSchema = z.object({
  invitationId: z.string().uuid('invitationId must be a valid UUID'),
});
export const respondToInvitationSchema = z
  .object({
    status: z.enum(['accepted', 'declined', 'cancelled']),
  })
  .strict();