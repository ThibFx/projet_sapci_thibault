import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10); // 5MB par defaut

// Utiliser le stockage en memoire pour recuperer le buffer et convertir en Base64
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorise. Formats acceptes: JPEG, PNG, WebP'));
  }
};

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}
