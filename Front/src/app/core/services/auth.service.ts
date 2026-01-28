import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((response) => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.api.post<RefreshResponse>('/auth/refresh', { refreshToken }).pipe(
      tap((response) => {
        // Rotation: stocker les deux nouveaux tokens
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/logout', {}).pipe(
      tap(() => {
        this.tokenService.clearTokens();
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>('/auth/me');
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasTokens();
  }
}
