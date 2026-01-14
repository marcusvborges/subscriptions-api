import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePriceDto {
  @ApiProperty({ enum: ['month','year','week','day'] })
  @IsEnum(['month','year','week','day'])
  interval: 'month' | 'year' | 'week' | 'day';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  trialAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  trialDays?: number;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  metadata?: Record<string, any>;
}
