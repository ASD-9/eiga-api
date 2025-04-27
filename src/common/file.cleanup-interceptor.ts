import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as fs from 'fs';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
  files?: {
    image?: Express.Multer.File[];
    video?: Express.Multer.File[];
  };
}

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request: RequestWithFile = httpContext.getRequest();

    return next.handle().pipe(
      catchError((error) => {
        if (request.file) {
          if (fs.existsSync(request.file.path)) {
            fs.unlinkSync(request.file.path);
          }
        } else if (request.files) {
          if (request.files.image) {
            request.files.image.forEach((file) => {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            });
          }
          if (request.files.video) {
            request.files.video.forEach((file) => {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            });
          }
        }
        throw error;
      }),
    );
  }
}
