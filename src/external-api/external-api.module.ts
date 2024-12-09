import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoPair } from '../crypto-pair/crypto-pair.entity';
import { CryptoRate } from '../crypto-rate/crypto-rate.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([CryptoPair, CryptoRate])],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}
