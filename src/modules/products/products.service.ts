import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        title: createProductDto.title,
        slug: this.generateSlug(createProductDto.title),
        description: createProductDto.description,
        price: createProductDto.price,
        discountPrice: createProductDto.discountPrice,
        finalPrice: createProductDto.discountPrice || createProductDto.price,
        inStock: createProductDto.inStock || 0,
        mainImage: createProductDto.mainImage,
        categoryId: createProductDto.categoryId,
        sellerId: userId,
        isAvailable: createProductDto.isAvailable !== false,
      },
    });

    return product;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { isAvailable: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { isAvailable: true } }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, isAvailable: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(userId: string, id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.update({
      where: { id },
      data: { isAvailable: false },
    });

    return { message: 'Product deleted successfully' };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}