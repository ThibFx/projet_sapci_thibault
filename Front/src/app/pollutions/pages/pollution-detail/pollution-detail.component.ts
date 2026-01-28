import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize, map } from 'rxjs/operators';

import {
  POLLUTION_STATUS_LABELS,
  POLLUTION_TYPE_LABELS,
  Pollution,
  PollutionType,
  PollutionStatus,
  getPhotoDataUrl
} from '../../models/pollution.model';
import { PollutionService } from '../../pollution.service';
import { FavoritesService } from '../../../features/favorites/favorites.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../store/auth/auth.state';

@Component({
  selector: 'app-pollution-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pollution-detail.component.html',
  styleUrl: './pollution-detail.component.scss'
})
export class PollutionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pollutionService = inject(PollutionService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly store = inject(Store);

  readonly pollution = signal<Pollution | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly togglingFavorite = signal(false);
  readonly typeLabels = POLLUTION_TYPE_LABELS;
  readonly statusLabels = POLLUTION_STATUS_LABELS;
  readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Identifiant de pollution manquant.');
      this.isLoading.set(false);
      return;
    }

    this.pollutionService
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (value) => this.pollution.set(value),
        error: () => this.error.set('Impossible de charger la pollution.')
      });
  }

  getTypeLabel(type: PollutionType | undefined) {
    return type ? this.typeLabels[type] : '';
  }

  getStatusLabel(status: PollutionStatus | undefined) {
    return status ? this.statusLabels[status] : '';
  }

  getPhotoUrl(): string | null {
    return getPhotoDataUrl(this.pollution());
  }

  toggleFavorite(): void {
    const pollution = this.pollution();
    if (!pollution || this.togglingFavorite()) return;

    this.togglingFavorite.set(true);

    const action$ = pollution.isFavorite
      ? this.favoritesService.removeFavorite(pollution.id).pipe(map(() => void 0))
      : this.favoritesService.addFavorite(pollution.id).pipe(map(() => void 0));

    action$.subscribe({
      next: () => {
        this.togglingFavorite.set(false);
        this.pollution.update((p) => p ? { ...p, isFavorite: !p.isFavorite } : null);
      },
      error: () => {
        this.togglingFavorite.set(false);
        this.error.set('Erreur lors de la mise a jour des favoris');
      }
    });
  }
}
