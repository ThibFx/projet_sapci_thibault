import dotenv from 'dotenv';

dotenv.config();

// Durées d'expiration en secondes pour éviter les problèmes de type
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 jours

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  accessTokenExpiry: ACCESS_TOKEN_EXPIRY_SECONDS,
  refreshTokenExpiry: REFRESH_TOKEN_EXPIRY_SECONDS
};

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
