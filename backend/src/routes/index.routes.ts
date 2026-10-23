import { Router } from 'express';
import authRoutes from './auth.routes';


const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
router.use('/auth', authRoutes);



export default router;