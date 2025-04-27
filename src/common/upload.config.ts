import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';

type MulterCallback = (error: Error | null, value: string) => void;

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
  (req: Request, file: Express.Multer.File, cb: MulterCallback) => {
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
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: MulterCallback,
    ) => {
      if (file.fieldname === 'image') {
        cb(null, path.join(process.cwd(), 'public', 'movies', 'images'));
      } else {
        cb(null, path.join(process.cwd(), 'public', 'movies', 'videos'));
      }
    },
    filename: editFileName('movie'),
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: MulterFileFilterCallback,
  ) => {
    if (file.fieldname === 'image') {
      fileFilter(['image/jpeg', 'image/png'])(req, file, cb);
    } else {
      fileFilter(['video/mp4'])(req, file, cb);
    }
  },
};
