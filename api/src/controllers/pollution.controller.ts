import { Request, Response } from 'express';
import { pollutionService, PollutionService, PhotoData } from '../services/pollution.service';
import { CreatePollutionBody, UpdatePollutionBody, PollutionFilters } from '../dto/pollution.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PollutionController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters: PollutionFilters = {
        search: req.query.search as string | undefined,
        type: req.query.type as string | undefined,
        city: req.query.city as string | undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      };

      const userId = req.user?.userId;
      const result = await pollutionService.findAll(filters, userId);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la recuperation';
      res.status(500).json({ message });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const pollution = await pollutionService.findById(id, userId);

      if (!pollution) {
        res.status(404).json({ message: 'Pollution non trouvee' });
        return;
      }

      res.json(pollution);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({ message });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body: CreatePollutionBody = req.body;
      const discovererId = req.user?.userId || null;

      // Convertir le fichier en Base64 si present
      let photoData: PhotoData | null = null;
      if (req.file && req.file.buffer) {
        photoData = PollutionService.fileToBase64(req.file.buffer, req.file.mimetype);
      }

      const pollution = await pollutionService.create(body, photoData, discovererId);
      res.status(201).json(pollution);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la creation';
      res.status(400).json({ message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const body: UpdatePollutionBody = req.body;

      // Verifier que la pollution existe et appartient a l'utilisateur
      const existingPollution = await pollutionService.findById(id);
      if (!existingPollution) {
        res.status(404).json({ message: 'Pollution non trouvee' });
        return;
      }

      if (existingPollution.discovererId !== userId) {
        res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres pollutions' });
        return;
      }

      // Convertir le fichier en Base64 si present
      let photoData: PhotoData | null | undefined;
      if (req.file && req.file.buffer) {
        photoData = PollutionService.fileToBase64(req.file.buffer, req.file.mimetype);
      }

      const pollution = await pollutionService.update(id, body, photoData);
      res.json(pollution);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise a jour';
      res.status(400).json({ message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Verifier que la pollution existe et appartient a l'utilisateur
      const existingPollution = await pollutionService.findById(id);
      if (!existingPollution) {
        res.status(404).json({ message: 'Pollution non trouvee' });
        return;
      }

      if (existingPollution.discovererId !== userId) {
        res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres pollutions' });
        return;
      }

      await pollutionService.delete(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      res.status(500).json({ message });
    }
  }
}

export const pollutionController = new PollutionController();
