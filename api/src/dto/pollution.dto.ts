import { body, query } from 'express-validator';

const pollutionTypes = ['plastic', 'chemical', 'wild_dumping', 'water', 'air', 'other'];
const pollutionStatuses = ['open', 'investigating', 'resolved'];

export const createPollutionDto = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le nom doit contenir entre 3 et 255 caracteres'),
  body('type')
    .isIn(pollutionTypes)
    .withMessage(`Le type doit etre l'un des suivants: ${pollutionTypes.join(', ')}`),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise')
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas depasser 100 caracteres'),
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit etre entre -90 et 90'),
  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit etre entre -180 et 180'),
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('L\'adresse ne peut pas depasser 500 caracteres'),
  body('recordedAt')
    .isISO8601()
    .withMessage('La date d\'enregistrement doit etre au format ISO 8601'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('La description doit contenir entre 10 et 10000 caracteres'),
  body('status')
    .optional()
    .isIn(pollutionStatuses)
    .withMessage(`Le statut doit etre l'un des suivants: ${pollutionStatuses.join(', ')}`)
];

export const updatePollutionDto = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le nom doit contenir entre 3 et 255 caracteres'),
  body('type')
    .optional()
    .isIn(pollutionTypes)
    .withMessage(`Le type doit etre l'un des suivants: ${pollutionTypes.join(', ')}`),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ville est requise')
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas depasser 100 caracteres'),
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit etre entre -90 et 90'),
  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit etre entre -180 et 180'),
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('L\'adresse ne peut pas depasser 500 caracteres'),
  body('recordedAt')
    .optional()
    .isISO8601()
    .withMessage('La date d\'enregistrement doit etre au format ISO 8601'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('La description doit contenir entre 10 et 10000 caracteres'),
  body('status')
    .optional()
    .isIn(pollutionStatuses)
    .withMessage(`Le statut doit etre l'un des suivants: ${pollutionStatuses.join(', ')}`)
];

export const pollutionFiltersDto = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 }),
  query('type')
    .optional()
    .isIn([...pollutionTypes, ''])
    .withMessage(`Le type doit etre l'un des suivants: ${pollutionTypes.join(', ')}`),
  query('city')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('status')
    .optional()
    .isIn([...pollutionStatuses, ''])
    .withMessage(`Le statut doit etre l'un des suivants: ${pollutionStatuses.join(', ')}`),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit etre un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit etre entre 1 et 100')
];

export interface CreatePollutionBody {
  name: string;
  type: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  recordedAt: string;
  description: string;
  status?: string;
}

export interface UpdatePollutionBody {
  name?: string;
  type?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  recordedAt?: string;
  description?: string;
  status?: string;
}

export interface PollutionFilters {
  search?: string;
  type?: string;
  city?: string;
  status?: string;
  page?: number;
  limit?: number;
}
