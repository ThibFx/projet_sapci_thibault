import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas ajouter de token pour les routes publiques
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  if (isPublicEndpoint) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();

  // Si pas de token, continuer sans authentification
  if (!accessToken) {
    return next(req);
  }

  // Ajouter le token a la requete
  const authReq = addTokenToRequest(req, accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si erreur 401 avec code TOKEN_EXPIRED, tenter un refresh
      if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
        const refreshToken = tokenService.getRefreshToken();

        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = tokenService.getAccessToken();
              if (newToken) {
                const retryReq = addTokenToRequest(req, newToken);
                return next(retryReq);
              }
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              // Refresh echoue, deconnecter l'utilisateur
              tokenService.clearTokens();
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
        }
      }

      // Si 401 classique, deconnecter
      if (error.status === 401) {
        tokenService.clearTokens();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
