import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUppercase,
  Min,
} from 'class-validator';
import { ResponseDTO } from '../common/response.dto';
import { PaginationMetadata } from '../common/pagination';

export class CreatePairRequest {
  @ApiProperty({
    example: 'DOGE',
    required: true,
    description: 'Base currency of pair',
  })
  @IsUppercase()
  @IsNotEmpty()
  base: string;

  @ApiProperty({
    example: 'BTC',
    required: true,
    description: 'Quote currency of pair',
  })
  @IsUppercase()
  @IsNotEmpty()
  quote: string;

  @ApiProperty({
    minimum: 1,
    example: 10,
    description: 'How often to fetch exchange rate from Binance in minutes',
    required: true,
  })
  @IsNumber()
  @Min(1)
  updateInterval: number;
}

export class UpdatePairRequest {
  @ApiProperty({
    minimum: 1,
    example: 10,
    description: 'How often to fetch exchange rate from Binance in minutes',
    required: true,
  })
  @IsNumber()
  updateInterval: number;

  @ApiProperty({
    description: 'Whether to fetch exchange rates from Binance',
  })
  @IsBoolean()
  isActive: boolean;
}

export class GetPairsDTO {
  @ApiProperty({
    required: false,
    description: 'The page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({
    required: false,
    description: 'The limit of records per page',
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  limit?: number;
}

class PairDTO {
  @ApiProperty({
    example: 1,
    description: 'The id of the pair',
  })
  id: number;

  @ApiProperty({
    example: 'DOGE',
    description: 'Base currency of pair',
  })
  baseCurrency: string;

  @ApiProperty({
    example: 'BTC',
    description: 'Quote currency of pair',
  })
  quoteCurrency: string;

  @ApiProperty({
    example: 10,
    description: 'How often to fetch exchange rate from Binance in minutes',
  })
  updateInterval: number;

  @ApiProperty({
    example: true,
    description: 'Whether to fetch exchange rates from Binance',
  })
  isActive: boolean;
}

class GetPairBodyDTO {
  @ApiProperty({
    type: PaginationMetadata,
    description: 'The metadata associated with this response.',
  })
  metadata: PaginationMetadata;
  @ApiProperty({
    type: [PairDTO],
    description: 'The data associated with this response.',
  })
  data: PairDTO[];
}

export class GetPairResponseDTO extends ResponseDTO {
  @ApiProperty({
    type: GetPairBodyDTO,
    description: 'The body associated with this response.',
  })
  body: GetPairBodyDTO;
}
