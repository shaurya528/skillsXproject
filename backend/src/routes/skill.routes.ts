import { Router } from 'express';
import { listSkills } from '../controllers/skill.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { listSkillsQuerySchema } from '../validators/skill.validator';

const router = Router();

router.get('/', requireAuth, validate(listSkillsQuerySchema, 'query'), listSkills);

export default router;