import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';

import {
  Pollution,
  PollutionFilters,
  PaginatedResponse,
  CreatePollutionPayload,
  UpdatePollutionPayload
} from './models/pollution.model';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  private readonly api = inject(ApiService);

  private readonly pollutionsSignal = signal<Pollution[]>([]);
  private readonly totalSignal = signal<number>(0);
  private readonly pageSignal = signal<number>(1);
  private readonly totalPagesSignal = signal<number>(0);
  private lastFilters: PollutionFilters = {};

  readonly pollutions = computed(() => this.pollutionsSignal());
  readonly total = computed(() => this.totalSignal());
  readonly page = computed(() => this.pageSignal());
  readonly totalPages = computed(() => this.totalPagesSignal());

  load(filters: PollutionFilters = {}): Observable<PaginatedResponse<Pollution>> {
    this.lastFilters = { ...filters };

    const params: Record<string, string | number | undefined> = {
      search: filters.search,
      type: filters.type,
      city: filters.city,
      status: filters.status,
      page: filters.page,
      limit: filters.limit
    };

    return this.api.get<PaginatedResponse<Pollution>>('/pollutions', params).pipe(
      tap((response) => {
        this.pollutionsSignal.set(response.data);
        this.totalSignal.set(response.total);
        this.pageSignal.set(response.page);
        this.totalPagesSignal.set(response.totalPages);
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement des pollutions:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<Pollution> {
    return this.api.get<Pollution>(`/pollutions/${id}`).pipe(
      catchError((error) => {
        console.error('Erreur lors du chargement de la pollution:', error);
        return throwError(() => error);
      })
    );
  }

  create(payload: CreatePollutionPayload, photo?: File): Observable<Pollution> {
    const formData = this.buildFormData(payload, photo);

    return this.api.postFormData<Pollution>('/pollutions', formData).pipe(
      tap(() => {
        // Rafraichir la liste apres creation
        this.load(this.lastFilters).subscribe();
      }),
      catchError((error) => {
        console.error('Erreur lors de la creation de la pollution:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: string, payload: UpdatePollutionPayload, photo?: File): Observable<Pollution> {
    const formData = this.buildFormData(payload, photo);

    return this.api.putFormData<Pollution>(`/pollutions/${id}`, formData).pipe(
      tap(() => {
        // Rafraichir la liste apres modification
        this.load(this.lastFilters).subscribe();
      }),
      catchError((error) => {
        console.error('Erreur lors de la modification de la pollution:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/pollutions/${id}`).pipe(
      tap(() => {
        // Rafraichir la liste apres suppression
        this.load(this.lastFilters).subscribe();
      }),
      catchError((error) => {
        console.error('Erreur lors de la suppression de la pollution:', error);
        return throwError(() => error);
      })
    );
  }

  private buildFormData(payload: CreatePollutionPayload | UpdatePollutionPayload, photo?: File): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (photo) {
      formData.append('photo', photo);
    }

    return formData;
  }
}
