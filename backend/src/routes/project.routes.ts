import { Router } from 'express';
import {
    createProject, getProject, updateProject, replaceRequiredSkills, deleteProject,changeProjectStatus
  } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    createProjectSchema, projectIdParamSchema, updateProjectSchema, replaceRequiredSkillsSchema,changeStatusSchema
  } from '../validators/project.validator';

const router = Router();

router.use(requireAuth); // every /projects route needs a logged-in user

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

export default router;