import { Router } from 'express';
import {
    createProject, getProject, updateProject, replaceRequiredSkills, deleteProject,changeProjectStatus,searchProjects
  } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    createProjectSchema, projectIdParamSchema, updateProjectSchema, replaceRequiredSkillsSchema,changeStatusSchema, searchProjectsQuerySchema
  } from '../validators/project.validator';
  import { submitApplication,listProjectApplications } from '../controllers/application.controller';
import { submitApplicationSchema,listApplicationsQuerySchema } from '../validators/application.validator';
import { sendInvitation, listProjectInvitations } from '../controllers/invitation.controller';
import { sendInvitationSchema, listInvitationsQuerySchema } from '../validators/invitation.validator';
import { listMembers, removeMember } from '../controllers/member.controller';
import { listMembersQuerySchema, memberParamsSchema } from '../validators/project.validator';

const router = Router();

router.use(requireAuth); 

router.post('/', validate(createProjectSchema), createProject);
router.get('/:projectId', validate(projectIdParamSchema, 'params'), getProject);
router.patch(
    '/:projectId',
    validate(projectIdParamSchema, 'params'),
    validate(updateProjectSchema),
    updateProject
  );
  router.put(
    '/:projectId/required-skills',
    validate(projectIdParamSchema, 'params'),
    validate(replaceRequiredSkillsSchema),
    replaceRequiredSkills
  );
  router.delete('/:projectId', validate(projectIdParamSchema, 'params'), deleteProject);
  router.patch(
    '/:projectId/status',
    validate(projectIdParamSchema, 'params'),
    validate(changeStatusSchema),
    changeProjectStatus
  );
  router.get('/', validate(searchProjectsQuerySchema, 'query'), searchProjects);
  

router.post(
  '/:projectId/applications',
  validate(projectIdParamSchema, 'params'),
  validate(submitApplicationSchema),
  submitApplication
);
router.get(
  '/:projectId/applications',
  validate(projectIdParamSchema, 'params'),
  validate(listApplicationsQuerySchema, 'query'),
  listProjectApplications
);


router.post(
  '/:projectId/invitations',
  validate(projectIdParamSchema, 'params'),
  validate(sendInvitationSchema),
  sendInvitation
);
router.get(
  '/:projectId/invitations',
  validate(projectIdParamSchema, 'params'),
  validate(listInvitationsQuerySchema, 'query'),
  listProjectInvitations
);


router.get(
  '/:projectId/members',
  validate(projectIdParamSchema, 'params'),
  validate(listMembersQuerySchema, 'query'),
  listMembers
);
router.delete('/:projectId/members/:userId', validate(memberParamsSchema, 'params'), removeMember);

export default router;