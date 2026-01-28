import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { registerDto, loginDto, refreshTokenDto } from '../dto/auth.dto';
import { validateRequest } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  registerDto,
  validateRequest,
  (req: Request, res: Response) => authController.register(req, res)
);

router.post(
  '/login',
  loginDto,
  validateRequest,
  (req: Request, res: Response) => authController.login(req, res)
);

router.post(
  '/refresh',
  refreshTokenDto,
  validateRequest,
  (req: Request, res: Response) => authController.refresh(req, res)
);

router.post(
  '/logout',
  authMiddleware,
  (req: Request, res: Response) => authController.logout(req, res)
);

router.get(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => authController.me(req, res)
);

export default router;
