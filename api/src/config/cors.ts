import { CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requetes sans origin (comme Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorise par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
