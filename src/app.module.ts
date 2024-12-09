import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoPair } from './crypto-pair/crypto-pair.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoPairModule } from './crypto-pair/crypto-pair.module';
import { CryptoRateModule } from './crypto-rate/crypto-rate.module';
import { CryptoRate } from './crypto-rate/crypto-rate.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ExternalApiModule } from './external-api/external-api.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [CryptoPair, CryptoRate],
        synchronize: true,
      }),
    }),
    CacheModule.register({
      ttl: 60,
      max: 100,
      isGlobal: true,
    }),
    ExternalApiModule,
    CryptoPairModule,
    CryptoRateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
