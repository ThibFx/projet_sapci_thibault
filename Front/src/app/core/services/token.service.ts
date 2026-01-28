import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  hasTokens(): boolean {
    return this.accessToken !== null && this.refreshToken !== null;
  }

  isAccessTokenExpired(): boolean {
    if (!this.accessToken) {
      return true;
    }

    try {
      const payload = this.decodeToken(this.accessToken);
      if (!payload || !payload.exp) {
        return true;
      }
      // Verifier si le token expire dans moins de 60 secondes
      return payload.exp * 1000 < Date.now() + 60000;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): { exp?: number; userId?: string; email?: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = atob(parts[1]);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  getUserIdFromToken(): string | null {
    if (!this.accessToken) {
      return null;
    }

    const payload = this.decodeToken(this.accessToken);
    return payload?.userId ?? null;
  }
}
