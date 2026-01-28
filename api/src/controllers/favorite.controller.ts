import { Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class FavoriteController {
  async getUserFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifie' });
        return;
      }

      const favorites = await favoriteService.getUserFavorites(req.user.userId);
      res.json(favorites);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({ message });
    }
  }

  async addFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifie' });
        return;
      }

      const { pollutionId } = req.params;
      const result = await favoriteService.addFavorite(req.user.userId, pollutionId);

      if (!result) {
        res.status(404).json({ message: 'Pollution non trouvee' });
        return;
      }

      res.status(201).json({ message: 'Ajoute aux favoris' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({ message });
    }
  }

  async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifie' });
        return;
      }

      const { pollutionId } = req.params;
      const removed = await favoriteService.removeFavorite(req.user.userId, pollutionId);

      if (!removed) {
        res.status(404).json({ message: 'Favori non trouve' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({ message });
    }
  }
}

export const favoriteController = new FavoriteController();
