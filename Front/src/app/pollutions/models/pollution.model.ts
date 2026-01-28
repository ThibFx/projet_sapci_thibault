export interface Pollution {
  id: string;
  name: string;
  type: PollutionType;
  city: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  recordedAt: string;
  description: string;
  status: PollutionStatus;
  photoData: string | null;
  photoMimeType: string | null;
  discovererId: string | null;
  discovererName: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fonction utilitaire pour generer l'URL data: pour afficher une image Base64
export function getPhotoDataUrl(pollution: Pollution | null): string | null {
  if (!pollution?.photoData || !pollution?.photoMimeType) {
    return null;
  }
  return `data:${pollution.photoMimeType};base64,${pollution.photoData}`;
}

export type PollutionType =
  | 'plastic'
  | 'chemical'
  | 'wild_dumping'
  | 'water'
  | 'air'
  | 'other';
export type PollutionStatus = 'open' | 'investigating' | 'resolved';

export const POLLUTION_TYPE_LABELS: Record<PollutionType, string> = {
  plastic: 'Plastique',
  chemical: 'Chimique',
  wild_dumping: 'Depot Sauvage',
  water: 'Eau',
  air: 'Air',
  other: 'Autre'
};

export const POLLUTION_STATUS_LABELS: Record<PollutionStatus, string> = {
  open: 'Ouvert',
  investigating: 'Investigation',
  resolved: 'Resolu'
};

export interface PollutionFilters {
  search?: string;
  type?: PollutionType | '';
  city?: string;
  status?: PollutionStatus | '';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePollutionPayload {
  name: string;
  type: PollutionType;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  recordedAt: string;
  description: string;
  status?: PollutionStatus;
}

export interface UpdatePollutionPayload {
  name?: string;
  type?: PollutionType;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  recordedAt?: string;
  description?: string;
  status?: PollutionStatus;
}
