import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, Matches } from 'class-validator';
import { PaginationMetadata } from '../common/pagination';
import { ResponseDTO } from '../common/response.dto';

export class GetRatesDTO {
  @ApiProperty({
    required: false,
    description: 'The page number',
    minimum: 1,
    default: 1,
  })
  page?: number;

  @ApiProperty({
    required: false,
    description: 'The limit of records per page',
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'The start date of the rates',
    type: 'string',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    required: false,
    description: 'The end date of the rates',
    type: 'string',
    example: '2024-12-12',
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    required: false,
    description: 'The id of the pair',
    type: 'number',
  })
  pairid?: number;

  @ApiProperty({
    required: false,
    description:
      'The column by which to sort the rates, can be reversed by prepending with a -',
    type: 'string',
    example: 'rate',
  })
  @IsOptional()
  @Matches(/[+-]?\S+/)
  sort?: string;
}

class RateDTO {
  @ApiProperty({
    example: 1,
    description: 'The id of the rate',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'The id of the pair',
  })
  pairId: number;

  @ApiProperty({
    example: 0.1,
    description: 'The exchange rate',
  })
  rate: number;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'The timestamp of the rate',
  })
  timestamp: Date;
}

class GetRatesBodyDTO {
  @ApiProperty({
    type: PaginationMetadata,
    description: 'The metadata associated with this response.',
  })
  metadata: PaginationMetadata;
  @ApiProperty({
    type: [RateDTO],
    description: 'The data associated with this response.',
  })
  data: RateDTO[];
}

export class GetRatesResponseDTO extends ResponseDTO {
  @ApiProperty({
    type: GetRatesBodyDTO,
    description: 'The body associated with this response.',
  })
  body: GetRatesBodyDTO;
}
