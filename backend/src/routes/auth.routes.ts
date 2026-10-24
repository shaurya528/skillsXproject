import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  passwordResetSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refreshToken);
router.post('/logout', requireAuth, logout);
router.post('/password-reset-requests', validate(passwordResetSchema), requestPasswordReset);

export default router;