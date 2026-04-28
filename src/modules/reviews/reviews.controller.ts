import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product review' })
  async createReview(@Request() req, @Param('productId') productId: string, @Body() createReviewDto: any) {
    return this.reviewsService.createReview(req.user.id, productId, createReviewDto);
  }

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Get product reviews' })
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review' })
  async updateReview(@Request() req, @Param('id') id: string, @Body() updateReviewDto: any) {
    return this.reviewsService.updateReview(req.user.id, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review' })
  async deleteReview(@Request() req, @Param('id') id: string) {
    return this.reviewsService.deleteReview(req.user.id, id);
  }
}