import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CryptoRate } from './crypto-rate.entity';
import { PaginationMetadata } from '../common/pagination';

@Injectable()
export class CryptoRateService {
  constructor(
    @InjectRepository(CryptoRate)
    private readonly rateRepository: Repository<CryptoRate>,
  ) {}

  async getRates(
    page: number,
    limit: number,
    filter: {
      startDate?: Date;
      endDate?: Date;
      sort?: string;
    },
  ): Promise<{ metadata: PaginationMetadata; data: CryptoRate[] }> {
    const startDate = filter.startDate;
    const endDate = filter.endDate;

    const sort = filter.sort;

    const sortDirection = sort?.startsWith('-') ? 'DESC' : 'ASC';
    const sortField = sort ? sort.replace(/^[-+]/, '') : 'timestamp';

    const [records, total] = await this.rateRepository.findAndCount({
      where: {
        ...(startDate && { timestamp: MoreThanOrEqual(startDate) }),
        ...(endDate && { timestamp: LessThanOrEqual(endDate) }),
      },
      order: { [sortField]: sortDirection },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      metadata: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: records,
    };
  }
}
