import { Controller, Get, Inject, Query } from '@nestjs/common';
import { GetRatesDTO, GetRatesResponseDTO } from './crypto-rate.dto';
import { CryptoRateService } from './crypto-rate.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('rates')
export class CryptoRateController {
  constructor(
    @Inject()
    private readonly rateService: CryptoRateService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @ApiOkResponse({
    type: GetRatesResponseDTO,
    description: 'The rates of the requested pairs',
  })
  @Get()
  async getRates(@Query() query: GetRatesDTO): Promise<GetRatesResponseDTO> {
    const cacheKey = `rates-${JSON.stringify(query)}`;
    const cachedRates = await this.cacheManager.get(cacheKey);

    if (cachedRates) {
      return cachedRates as GetRatesResponseDTO;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 10, 50));

    this.rateService.getRates(page, limit, query);

    const result = await this.rateService.getRates(page, limit, query);
    const response = {
      body: {
        metadata: result.metadata,
        data: result.data.map((rate) => ({
          id: rate.id,
          pairId: rate.pairId,
          rate: rate.rate,
          timestamp: rate.timestamp,
        })),
      },
      message: 'Success',
      statusCode: 200,
    };

    await this.cacheManager.set(cacheKey, response);
    return response;
  }
}
