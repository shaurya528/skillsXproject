import { Router } from 'express';
import { getApplication, decideApplication } from '../controllers/application.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { applicationIdParamSchema, decideApplicationSchema } from '../validators/application.validator';

const router = Router();

router.use(requireAuth);

router.get('/:applicationId', validate(applicationIdParamSchema, 'params'), getApplication);
router.patch(
    '/:applicationId/status',
    validate(applicationIdParamSchema, 'params'),
    validate(decideApplicationSchema),
    decideApplication
  );

export default router;