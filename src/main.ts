import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          message: 'Erreur de validation',
          details: errors.flatMap((error) =>
            Object.values(error.constraints ?? {}),
          ),
        });
      },
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector')),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
