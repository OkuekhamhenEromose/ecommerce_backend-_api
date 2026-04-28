import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great product!', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'This product exceeded my expectations...' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;
}
