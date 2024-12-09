import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ResponseDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The message associated with the response.',
  })
  message: string;

  @IsNumber()
  @ApiProperty({ description: 'The response status code.', example: 200 })
  statusCode: number;
}
