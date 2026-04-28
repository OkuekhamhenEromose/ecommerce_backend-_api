import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  personalizations?: any;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;
}