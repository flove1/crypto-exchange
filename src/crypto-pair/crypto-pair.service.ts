import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ExternalApiService } from '../external-api/external-api.service';
import { CryptoPair } from './crypto-pair.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMetadata } from '../common/pagination';

@Injectable()
export class CryptoPairService {
  private readonly logger = new Logger(CryptoPairService.name);

  constructor(
    @InjectRepository(CryptoPair)
    private readonly cryptoPairRepository: Repository<CryptoPair>,
    private readonly externalApiService: ExternalApiService,
  ) {}

  async createPair(pair: CryptoPair) {
    if (!(await this.externalApiService.validatePair(pair))) {
      throw new HttpException(
        'The given pair does not exists on Binance or API is down',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.cryptoPairRepository
      .save(pair)
      .catch((exception: QueryFailedError) => {
        if (exception.message.includes('violates unique constraint')) {
          throw new HttpException(
            'A pair with same symbol already exists',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          this.logger.error(exception.message);
          throw new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      });
  }

  async getPairs(
    limit: number,
    page: number,
  ): Promise<{ metadata: PaginationMetadata; data: CryptoPair[] }> {
    const [records, total] = await this.cryptoPairRepository.findAndCount({
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      metadata: {
        page,
        total,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: records,
    };
  }

  async updatePairs(id: number, activated: boolean, interval: number) {
    const pair = await this.cryptoPairRepository.findOne({
      where: { id },
    });

    if (!pair) {
      throw new HttpException('Pair not found', HttpStatus.NOT_FOUND);
    }

    const isActivationChanged = pair.isActive !== activated;
    const isIntervalChanged = pair.updateInterval !== interval;

    if (!isActivationChanged && !isIntervalChanged) {
      return pair;
    }

    pair.updateInterval = interval;
    pair.isActive = activated;

    return this.cryptoPairRepository.save(pair).then((updatedPair) => {
      if (updatedPair.isActive) {
        if (isActivationChanged) {
          this.externalApiService.startJob(updatedPair);
        } else {
          this.externalApiService.changeInterval(updatedPair);
        }
      } else {
        this.externalApiService.stopJob(updatedPair);
      }

      return updatedPair;
    });
  }

  async deletePair(id: number) {
    const pair = await this.cryptoPairRepository.findOne({
      where: { id },
    });

    if (!pair) {
      throw new HttpException('Pair not found', HttpStatus.NOT_FOUND);
    }

    this.externalApiService.stopJob(pair);

    return this.cryptoPairRepository.remove(pair);
  }
}
