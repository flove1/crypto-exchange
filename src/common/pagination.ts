import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadata {
  @ApiProperty({
    required: false,
    description: 'The page number',
    minimum: 1,
    default: 1,
  })
  page: number;

  @ApiProperty({
    required: false,
    description: 'The limit of records per page',
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  limit: number;

  @ApiProperty({
    required: false,
    description: 'The total number of records',
    minimum: 1,
  })
  total: number;

  @ApiProperty({
    required: false,
    description: 'The total number of pages',
  })
  totalPages: number;
}
