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
}

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request: RequestWithFile = httpContext.getRequest();

    return next.handle().pipe(
      catchError((error) => {
        if (request.file) {
          fs.unlinkSync(request.file.path);
        }
        throw error;
      }),
    );
  }
}
