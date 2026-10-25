import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    getMe, updateMe, deleteMe, replaceMySkills, getMyContact, updateMyContact,
  } from '../controllers/user.controller';
  import {
    updateProfileSchema, replaceSkillsSchema, updateContactSchema,
  } from '../validators/user.validator';
  

const router = Router();

router.use(requireAuth); 
router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.delete('/me', deleteMe);
router.put('/me/skills', validate(replaceSkillsSchema), replaceMySkills);
router.get('/me/contact', getMyContact);
router.patch('/me/contact', validate(updateContactSchema), updateMyContact);

export default router;