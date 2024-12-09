import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoRate } from './crypto-rate.entity';
import { CryptoRateController } from './crypto-rate.controller';
import { CryptoRateService } from './crypto-rate.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoRate])],
  controllers: [CryptoRateController],
  providers: [CryptoRateService],
  exports: [],
})
export class CryptoRateModule {}
