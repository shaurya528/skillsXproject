import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import skillRoutes from './skill.routes';


const router = Router();


router.use('/skills', skillRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
router.use('/auth', authRoutes);
router.use('/users', userRoutes);



export default router;