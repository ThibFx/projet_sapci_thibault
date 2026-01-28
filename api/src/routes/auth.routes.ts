import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { registerDto, loginDto, refreshTokenDto } from '../dto/auth.dto';
import { validateRequest } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  registerDto,
  validateRequest,
  (req, res) => authController.register(req, res)
);

router.post(
  '/login',
  loginDto,
  validateRequest,
  (req, res) => authController.login(req, res)
);

router.post(
  '/refresh',
  refreshTokenDto,
  validateRequest,
  (req, res) => authController.refresh(req, res)
);

router.post(
  '/logout',
  authMiddleware,
  (req, res) => authController.logout(req, res)
);

router.get(
  '/me',
  authMiddleware,
  (req, res) => authController.me(req, res)
);

export default router;
