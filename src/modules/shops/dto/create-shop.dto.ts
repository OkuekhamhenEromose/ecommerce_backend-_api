import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'My Awesome Shop' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  shopName: string;

  @ApiProperty({ example: 'We sell amazing handmade products...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'USD', enum: ['USD', 'EUR', 'GBP', 'NGN'] })
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP', 'NGN'])
  currency?: string;

  @ApiProperty({ example: 'en', enum: ['en', 'fr', 'es', 'de'] })
  @IsOptional()
  @IsIn(['en', 'fr', 'es', 'de'])
  language?: string;
}
