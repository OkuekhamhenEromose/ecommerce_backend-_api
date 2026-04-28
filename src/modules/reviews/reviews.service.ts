import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, productId: string, createReviewDto: CreateReviewDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: createReviewDto.rating,
        title: createReviewDto.title,
        comment: createReviewDto.comment,
        productId,
        userId,
        profileId: profile!.id,
      },
    });

    // Update product rating
    await this.updateProductRating(productId);

    return review;
  }

  async getProductReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      reviews,
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count,
    };
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: Partial<CreateReviewDto>) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
    });

    await this.updateProductRating(review.productId);

    return updated;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    await this.updateProductRating(review.productId);

    return { message: 'Review deleted successfully' };
  }

  private async updateProductRating(productId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });
  }
}
