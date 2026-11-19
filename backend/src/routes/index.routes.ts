import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import skillRoutes from './skill.routes';
import projectRoutes from './project.routes';
import applicationRoutes from './application.routes';
import invitationRoutes from './invitation.routes';
import notificationRoutes from './notification.routes';




const router = Router();


router.use('/skills', skillRoutes);


router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
router.use('/auth', authRoutes);
router.use('/users', userRoutes);


router.use('/projects', projectRoutes);


router.use('/applications', applicationRoutes);

router.use('/invitations', invitationRoutes);

router.use('/notifications', notificationRoutes);


export default router;