import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getMe, updateMe, deleteMe, replaceMySkills } from '../controllers/user.controller';
import { updateProfileSchema, replaceSkillsSchema } from '../validators/user.validator';


const router = Router();

router.use(requireAuth); 
router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.delete('/me', deleteMe);
router.put('/me/skills', validate(replaceSkillsSchema), replaceMySkills);

export default router;