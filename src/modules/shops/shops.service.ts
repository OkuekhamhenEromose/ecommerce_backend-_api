import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async createShop(userId: string, createShopDto: any) {
    // Get user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a shop
    const existingShop = await this.prisma.shop.findFirst({
      where: { sellerId: userId },
    });

    if (existingShop) {
      throw new ConflictException('You already have a shop');
    }

    const shopSlug = this.generateSlug(createShopDto.shopName);

    const shop = await this.prisma.shop.create({
      data: {
        shopName: createShopDto.shopName,
        shopSlug: shopSlug,
        description: createShopDto.description || '',
        country: createShopDto.country || 'United States',
        currency: createShopDto.currency || 'USD',
        language: createShopDto.language || 'en',
        sellerId: userId,
        isOpen: true,
      },
    });

    return { message: 'Shop created successfully', shop };
  }

  async getShopByUser(userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { sellerId: userId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async getShopBySlug(slug: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { shopSlug: slug, isActive: true },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async updateShop(userId: string, updateShopDto: any) {
    const shop = await this.prisma.shop.findUnique({
      where: { sellerId: userId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const updated = await this.prisma.shop.update({
      where: { id: shop.id },
      data: updateShopDto,
    });

    return { message: 'Shop updated successfully', shop: updated };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}