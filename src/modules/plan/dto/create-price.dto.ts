import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BillingInterval } from '../enum/billingInterval.enum';

export class CreatePriceDto {
  @ApiProperty({ enum: BillingInterval })
  @IsEnum(BillingInterval)
  interval!: BillingInterval;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

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
