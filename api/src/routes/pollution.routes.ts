import { Router } from 'express';
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
  (req, res) => pollutionController.findAll(req, res)
);

// Detail d'une pollution
router.get(
  '/:id',
  optionalAuthMiddleware,
  (req, res) => pollutionController.findById(req, res)
);

// Creer une pollution (authentification optionnelle - le createur sera enregistre si connecte)
router.post(
  '/',
  optionalAuthMiddleware,
  uploadPhoto.single('photo'),
  createPollutionDto,
  validateRequest,
  (req, res) => pollutionController.create(req, res)
);

// Modifier une pollution (authentification requise)
router.put(
  '/:id',
  authMiddleware,
  uploadPhoto.single('photo'),
  updatePollutionDto,
  validateRequest,
  (req, res) => pollutionController.update(req, res)
);

// Supprimer une pollution (authentification requise)
router.delete(
  '/:id',
  authMiddleware,
  (req, res) => pollutionController.delete(req, res)
);

export default router;
