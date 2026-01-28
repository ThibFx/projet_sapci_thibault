import { Router } from 'express';
import authRoutes from './auth.routes';
import pollutionRoutes from './pollution.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pollutions', pollutionRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
