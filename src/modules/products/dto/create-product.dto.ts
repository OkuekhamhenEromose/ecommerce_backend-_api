import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Awesome Product' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'This is a great product...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 19.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isAvailable?: boolean;
}