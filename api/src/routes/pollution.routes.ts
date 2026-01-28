import { Router, Request, Response } from 'express';
import { pollutionController } from '../controllers/pollution.controller';
import { createPollutionDto, updatePollutionDto, pollutionFiltersDto } from '../dto/pollution.dto';
import { validateRequest } from '../middleware/validate.middleware';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { uploadPhoto } from '../middleware/upload.middleware';

const router = Router();

// Liste des pollutions (authentification optionnelle pour les favoris)
router.get(
  '/',
  optionalAuthMiddleware,
  pollutionFiltersDto,
  validateRequest,
  (req: Request, res: Response) => pollutionController.findAll(req, res)
);

// Detail d'une pollution
router.get(
  '/:id',
  optionalAuthMiddleware,
  (req: Request, res: Response) => pollutionController.findById(req, res)
);

// Creer une pollution (authentification requise)
router.post(
  '/',
  authMiddleware,
  uploadPhoto.single('photo'),
  createPollutionDto,
  validateRequest,
  (req: Request, res: Response) => pollutionController.create(req, res)
);

// Modifier une pollution (authentification requise)
router.put(
  '/:id',
  authMiddleware,
  uploadPhoto.single('photo'),
  updatePollutionDto,
  validateRequest,
  (req: Request, res: Response) => pollutionController.update(req, res)
);

// Supprimer une pollution (authentification requise)
router.delete(
  '/:id',
  authMiddleware,
  (req: Request, res: Response) => pollutionController.delete(req, res)
);

export default router;
