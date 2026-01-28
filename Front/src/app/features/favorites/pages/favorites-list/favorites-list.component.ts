import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { FavoritesService } from '../../favorites.service';
import {
  Pollution,
  POLLUTION_TYPE_LABELS,
  POLLUTION_STATUS_LABELS,
  PollutionType,
  PollutionStatus,
  getPhotoDataUrl
} from '../../../../pollutions/models/pollution.model';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss'
})
export class FavoritesListComponent implements OnInit {
  private readonly favoritesService = inject(FavoritesService);

  readonly favorites = signal<Pollution[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly typeLabels = POLLUTION_TYPE_LABELS;
  readonly statusLabels = POLLUTION_STATUS_LABELS;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.favoritesService.getFavorites()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.favorites.set(data),
        error: (err) => {
          const message = err.error?.message || 'Erreur lors du chargement des favoris';
          this.error.set(message);
        }
      });
  }

  removeFavorite(pollution: Pollution): void {
    this.favoritesService.removeFavorite(pollution.id).subscribe({
      next: () => {
        this.favorites.update((items) => items.filter((item) => item.id !== pollution.id));
      },
      error: (err) => {
        const message = err.error?.message || 'Erreur lors du retrait des favoris';
        this.error.set(message);
      }
    });
  }

  getTypeLabel(type: PollutionType): string {
    return this.typeLabels[type];
  }

  getStatusLabel(status: PollutionStatus): string {
    return this.statusLabels[status];
  }

  getPhotoUrl(pollution: Pollution): string | null {
    return getPhotoDataUrl(pollution);
  }

  trackByPollutionId(_: number, pollution: Pollution): string {
    return pollution.id;
  }
}
