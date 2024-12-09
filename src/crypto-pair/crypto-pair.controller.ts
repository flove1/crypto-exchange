import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CryptoPair } from './crypto-pair.entity';
import {
  CreatePairRequest,
  GetPairResponseDTO,
  GetPairsDTO,
  UpdatePairRequest,
} from './crypto-pair.dto';
import { CryptoPairService } from './crypto-pair.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ResponseDTO } from '../common/response.dto';

@Controller('pairs')
export class CryptoPairController {
  constructor(
    private readonly cryptoPairService: CryptoPairService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @ApiCreatedResponse({
    type: ResponseDTO,
  })
  @Post()
  async createPair(@Body() request: CreatePairRequest): Promise<ResponseDTO> {
    const pair = new CryptoPair();

    pair.baseCurrency = request.base;
    pair.quoteCurrency = request.quote;
    pair.updateInterval = request.updateInterval;

    return await this.cryptoPairService.createPair(pair).then((pair) => {
      return {
        statusCode: 201,
        message: `Pair with id ${pair.id} was succesfully created`,
      };
    });
  }

  @ApiOkResponse({
    type: GetPairResponseDTO,
  })
  @Get()
  async getPairs(@Query() query: GetPairsDTO): Promise<GetPairResponseDTO> {
    const cacheKey = `pairs-${JSON.stringify(query)}`;
    const cachedPairs = await this.cacheManager.get(cacheKey);

    if (cachedPairs) {
      return cachedPairs as GetPairResponseDTO;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 10, 50));

    const pairs = await this.cryptoPairService.getPairs(limit, page);
    const response = {
      body: {
        metadata: pairs.metadata,
        data: pairs.data,
      },
      message: 'Success',
      statusCode: 200,
    };

    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  @ApiCreatedResponse({
    type: ResponseDTO,
  })
  @Put(':id')
  async updatePair(
    @Param('id') id: number,
    @Body() request: UpdatePairRequest,
  ): Promise<ResponseDTO> {
    return await this.cryptoPairService
      .updatePairs(id, request.isActive, request.updateInterval)
      .then(() => {
        return {
          message: `Pair with id ${id} was succesfully updated`,
          statusCode: 200,
        };
      });
  }

  @ApiCreatedResponse({
    type: ResponseDTO,
  })
  @Delete(':id')
  async deletePair(@Param('id') id: number): Promise<ResponseDTO> {
    return await this.cryptoPairService.deletePair(id).then(() => {
      return {
        message: `Pair with id ${id} was succesfully deleted`,
        statusCode: 200,
      };
    });
  }
}
