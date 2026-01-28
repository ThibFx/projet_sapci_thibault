import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

import { connectDatabase, syncDatabase } from './config/database';
import { corsOptions } from './config/cors';
import routes from './routes';

// Importer les modeles pour initialiser les associations
import './models';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (photos)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes API
app.use('/api', routes);

// Route de sante
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gestion des erreurs 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvee' });
});

// Gestion globale des erreurs
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erreur:', err);

  // Erreur Multer (upload)
  if (err.name === 'MulterError') {
    if ((err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Fichier trop volumineux (max 5MB)' });
      return;
    }
    res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
    return;
  }

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({ message: 'Erreur de validation', errors: err.message });
    return;
  }

  // Erreur generique
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur interne'
  });
});

// Demarrage du serveur
async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Serveur demarre sur le port ${PORT}`);
      console.log(`API disponible sur http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Impossible de demarrer le serveur:', error);
    process.exit(1);
  }
}

startServer();
