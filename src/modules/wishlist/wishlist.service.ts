import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    let wishlist = await this.prisma.wishlist.findUnique({
      where: { profileId: profile?.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
          profileId: profile!.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let wishlist = await this.prisma.wishlist.findUnique({
      where: { profileId: profile?.id },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
          profileId: profile!.id,
        },
      });
    }

    await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const wishlist = await this.prisma.wishlist.findUnique({
      where: { profileId: profile?.id },
    });

    if (wishlist) {
      await this.prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return this.getWishlist(userId);
  }
}
