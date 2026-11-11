import { Router } from 'express';
import { getInvitation, respondToInvitation } from '../controllers/invitation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { invitationIdParamSchema, respondToInvitationSchema } from '../validators/invitation.validator';

const router = Router();

router.use(requireAuth);

router.get('/:invitationId', validate(invitationIdParamSchema, 'params'), getInvitation);

router.patch(
  '/:invitationId/status',
  validate(invitationIdParamSchema, 'params'),
  validate(respondToInvitationSchema),
  respondToInvitation
);

export default router;