import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    getMe, updateMe, deleteMe, replaceMySkills, getMyContact, updateMyContact,searchTalent,getPublicProfile,listMyApplications,listMyInvitations
  } from '../controllers/user.controller';
  import {
    updateProfileSchema, replaceSkillsSchema, updateContactSchema,searchTalentQuerySchema,userIdParamSchema
  } from '../validators/user.validator';
  import { listApplicationsQuerySchema } from '../validators/application.validator';
  import { listInvitationsQuerySchema } from '../validators/invitation.validator';


  

const router = Router();

router.use(requireAuth); 
router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.delete('/me', deleteMe);
router.put('/me/skills', validate(replaceSkillsSchema), replaceMySkills);
router.get('/me/contact', getMyContact);
router.patch('/me/contact', validate(updateContactSchema), updateMyContact);
router.get('/', validate(searchTalentQuerySchema, 'query'), searchTalent);
router.get('/:userId', validate(userIdParamSchema, 'params'), getPublicProfile);
router.get('/me/applications', validate(listApplicationsQuerySchema, 'query'), listMyApplications);
router.get('/me/invitations', validate(listInvitationsQuerySchema, 'query'), listMyInvitations);

export default router;