import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  ValidationException,
  GlobalExceptionFilter,
  HttpExceptionFilter,
  ValidationExceptionFilter,
} from './app.exception';

export function applyConfig(app: INestApplication) {
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new ValidationException(errors),
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
}
