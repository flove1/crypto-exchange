import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoPair } from './crypto-pair.entity';
import { CryptoPairController } from './crypto-pair.controller';
import { ExternalApiModule } from 'src/external-api/external-api.module';
import { CryptoPairService } from './crypto-pair.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoPair]), ExternalApiModule],
  controllers: [CryptoPairController],
  providers: [CryptoPairService],
  exports: [],
})
export class CryptoPairModule {}
