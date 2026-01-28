import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RegisterBody, LoginBody, RefreshTokenBody } from '../dto/auth.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const body: RegisterBody = req.body;
      const result = await authService.register(body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const body: LoginBody = req.body;
      const result = await authService.login(body);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la connexion';
      res.status(401).json({ message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const body: RefreshTokenBody = req.body;
      const result = await authService.refreshAccessToken(body.refreshToken);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du rafraichissement';
      res.status(401).json({ message });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifie' });
        return;
      }

      await authService.logout(req.user.userId);
      res.json({ message: 'Deconnexion reussie' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la deconnexion';
      res.status(500).json({ message });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifie' });
        return;
      }

      const user = await authService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouve' });
        return;
      }

      res.json(user.toJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({ message });
    }
  }
}

export const authController = new AuthController();
