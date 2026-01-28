import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Pollution } from '../../pollutions/models/pollution.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly api = inject(ApiService);

  getFavorites(): Observable<Pollution[]> {
    return this.api.get<Pollution[]>('/favorites').pipe(
      catchError((error) => {
        console.error('Erreur lors du chargement des favoris:', error);
        return throwError(() => error);
      })
    );
  }

  addFavorite(pollutionId: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`/favorites/${pollutionId}`, {}).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        return throwError(() => error);
      })
    );
  }

  removeFavorite(pollutionId: string): Observable<void> {
    return this.api.delete<void>(`/favorites/${pollutionId}`).pipe(
      catchError((error) => {
        console.error('Erreur lors du retrait des favoris:', error);
        return throwError(() => error);
      })
    );
  }
}
