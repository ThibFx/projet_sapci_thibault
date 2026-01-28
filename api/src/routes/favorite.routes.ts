import { Router, Request, Response } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes de favoris necessitent une authentification
router.use(authMiddleware);

// Liste des favoris de l'utilisateur
router.get(
  '/',
  (req: Request, res: Response) => favoriteController.getUserFavorites(req, res)
);

// Ajouter une pollution aux favoris
router.post(
  '/:pollutionId',
  (req: Request, res: Response) => favoriteController.addFavorite(req, res)
);

// Retirer une pollution des favoris
router.delete(
  '/:pollutionId',
  (req: Request, res: Response) => favoriteController.removeFavorite(req, res)
);

export default router;
