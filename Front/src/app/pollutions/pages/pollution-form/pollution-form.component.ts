import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import {
  CreatePollutionPayload,
  UpdatePollutionPayload,
  PollutionStatus,
  PollutionType,
  getPhotoDataUrl
} from '../../models/pollution.model';
import { PollutionService } from '../../pollution.service';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pollution-form.component.html',
  styleUrl: './pollution-form.component.scss'
})
export class PollutionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pollutionService = inject(PollutionService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEditing = signal(false);
  readonly photoPreview = signal<string | null>(null);
  readonly existingPhotoUrl = signal<string | null>(null);
  readonly isGettingLocation = signal(false);

  private selectedPhoto: File | null = null;

  readonly pollutionTypes: Array<{ label: string; value: PollutionType }> = [
    { label: 'Plastique', value: 'plastic' },
    { label: 'Chimique', value: 'chemical' },
    { label: 'Depot Sauvage', value: 'wild_dumping' },
    { label: 'Eau', value: 'water' },
    { label: 'Air', value: 'air' },
    { label: 'Autre', value: 'other' }
  ];

  readonly statuses: Array<{ label: string; value: PollutionStatus }> = [
    { label: 'Ouvert', value: 'open' },
    { label: 'Investigation', value: 'investigating' },
    { label: 'Resolu', value: 'resolved' }
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['plastic' as PollutionType, Validators.required],
    city: ['', Validators.required],
    latitude: [null as number | null],
    longitude: [null as number | null],
    address: [''],
    recordedAt: [
      new Date().toISOString().slice(0, 10),
      Validators.required
    ],
    status: ['open' as PollutionStatus, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  private pollutionId: string | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.pollutionId = id;
      this.loadPollution(id);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Verifier le type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.error.set('Format de fichier non supporte. Utilisez JPEG, PNG ou WebP.');
        return;
      }

      // Verifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Le fichier est trop volumineux. Maximum 5 Mo.');
        return;
      }

      this.selectedPhoto = file;
      this.error.set(null);

      // Creer un apercu
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreview.set(null);
    this.existingPhotoUrl.set(null);
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error.set('La geolocalisation n\'est pas supportee par votre navigateur.');
      return;
    }

    this.isGettingLocation.set(true);
    this.error.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.isGettingLocation.set(false);
      },
      (error) => {
        let message = 'Impossible d\'obtenir votre position.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Vous avez refuse l\'acces a votre position.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position indisponible.';
            break;
          case error.TIMEOUT:
            message = 'Delai d\'attente depasse.';
            break;
        }
        this.error.set(message);
        this.isGettingLocation.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const request$ = this.isEditing() && this.pollutionId
      ? this.pollutionService.update(this.pollutionId, this.toUpdatePayload(), this.selectedPhoto || undefined)
      : this.pollutionService.create(this.toCreatePayload(), this.selectedPhoto || undefined);

    request$
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (pollution) =>
          this.router.navigate(['/pollutions', pollution.id]),
        error: (err) => {
          const message =
            err?.error?.message ??
            'Impossible de sauvegarder la pollution. Reessayez plus tard.';
          this.error.set(message);
        }
      });
  }

  private loadPollution(id: string): void {
    this.pollutionService.getById(id).subscribe({
      next: (pollution) => {
        this.form.patchValue({
          name: pollution.name,
          type: pollution.type,
          city: pollution.city,
          latitude: pollution.latitude,
          longitude: pollution.longitude,
          address: pollution.address || '',
          recordedAt: pollution.recordedAt.slice(0, 10),
          status: pollution.status,
          description: pollution.description
        });

        // Utiliser getPhotoDataUrl pour les photos en Base64
        const photoUrl = getPhotoDataUrl(pollution);
        if (photoUrl) {
          this.existingPhotoUrl.set(photoUrl);
        }
      },
      error: () => {
        this.error.set('Impossible de charger la pollution demandee.');
      }
    });
  }

  private toCreatePayload(): CreatePollutionPayload {
    const value = this.form.getRawValue();
    const recordedDate = value.recordedAt
      ? new Date(value.recordedAt)
      : new Date();

    return {
      name: value.name,
      type: value.type,
      city: value.city,
      latitude: value.latitude,
      longitude: value.longitude,
      address: value.address || null,
      recordedAt: recordedDate.toISOString(),
      status: value.status,
      description: value.description
    };
  }

  private toUpdatePayload(): UpdatePollutionPayload {
    const value = this.form.getRawValue();
    const recordedDate = value.recordedAt
      ? new Date(value.recordedAt)
      : new Date();

    return {
      name: value.name,
      type: value.type,
      city: value.city,
      latitude: value.latitude,
      longitude: value.longitude,
      address: value.address || null,
      recordedAt: recordedDate.toISOString(),
      status: value.status,
      description: value.description
    };
  }
}
