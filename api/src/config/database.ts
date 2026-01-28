import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL non definie dans les variables d\'environnement');
  process.exit(1);
}

// Activer SSL si l'URL contient "render.com" ou si on est en production
const useSSL = databaseUrl.includes('render.com') || process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: useSSL ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connexion a la base de donnees etablie avec succes.');
  } catch (error) {
    console.error('Impossible de se connecter a la base de donnees:', error);
    throw error;
  }
}

export async function syncDatabase(): Promise<void> {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Base de donnees synchronisee.');
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    throw error;
  }
}
