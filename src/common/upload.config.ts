import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';

type MulterFileNameCallback = (error: Error | null, value: string) => void;

type MulterFileFilterCallback = (error: Error | null, value: boolean) => void;

const fileFilter =
  (allowedTypes: string[]) =>
  (req: Request, file: Express.Multer.File, cb: MulterFileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`,
        ),
        false,
      );
    }
  };

const editFileName =
  (prefix: string) =>
  (req: Request, file: Express.Multer.File, cb: MulterFileNameCallback) => {
    const suffix: string = `-${Date.now()}`;
    const extension: string = path.extname(file.originalname);
    cb(null, `${prefix}${suffix}${extension}`);
  };

export const avatarUploadConfig = {
  storage: diskStorage({
    destination: path.join(process.cwd(), 'public', 'avatars'),
    filename: editFileName('avatar'),
  }),
  fileFilter: fileFilter(['image/jpeg', 'image/png']),
};

export const artistUploadConfig = {
  storage: diskStorage({
    destination: path.join(process.cwd(), 'public', 'artists'),
    filename: editFileName('artist'),
  }),
  fileFilter: fileFilter(['image/jpeg', 'image/png']),
};

export const movieUploadConfig = {
  storage: diskStorage({
    destination: path.join(process.cwd(), 'public', 'movies'),
    filename: editFileName('movie'),
  }),
  fileFilter: fileFilter(['video/mp4']),
};
