import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  planId!: string;

  @ApiPropertyOptional({
    description: 'Optional: use a specific plan price (price id) to charge',
  })
  @IsOptional()
  @IsUUID()
  planPriceId?: string;
}
