import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ProductCondition } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inStock: number;

  @ApiProperty({ enum: ProductCondition, default: ProductCondition.NEW })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiProperty()
  @IsString()
  mainImage: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image3?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image4?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDeal?: boolean;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeal?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  design?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inStock: number;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

import { PartialType } from '@nestjs/swagger';
