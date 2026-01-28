import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
};

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
