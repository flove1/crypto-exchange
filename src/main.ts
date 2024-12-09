import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applyConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyConfig(app);

  const config = new DocumentBuilder()
    .setTitle('Cryptocurrency exchange rates')
    .setDescription(
      'The API to track exchange rates of various cryptocurrencies on the basis of Binance API',
    )
    .setVersion('1.0')
    .addTag('crypto')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(3000);
}
bootstrap();
