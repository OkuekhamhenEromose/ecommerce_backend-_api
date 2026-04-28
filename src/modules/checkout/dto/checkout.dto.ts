import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class CheckoutAddressDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  streetAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty()
  @IsString()
  phoneCountryCode: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isGift?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  giftMessage?: string;
}

export class CheckoutItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePerUnit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  personalizations?: any;
}

export class InitiateCheckoutDto {
  @ApiProperty()
  address: CheckoutAddressDto;

  @ApiProperty({ default: 'PAYSTACK' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cartId?: string;

  @ApiProperty({ required: false, type: [CheckoutItemDto] })
  @IsOptional()
  @IsArray()
  localItems?: CheckoutItemDto[];
}
