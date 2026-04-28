import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';
import { CacheKeys } from '../../common/utils/cache-keys';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateVariantDto,
} from './dto/products.dto';
import { UserRole, ProductCondition } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(userId: string, dto: CreateProductDto) {
    // Check if user is a seller
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true },
    });

    if (user.role !== UserRole.SELLER && !user.shop) {
      throw new ForbiddenException('You need to be a seller to create products');
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(dto.title);

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        inStock: dto.inStock,
        condition: dto.condition || ProductCondition.NEW,
        mainImage: dto.mainImage,
        image1: dto.image1,
        image2: dto.image2,
        image3: dto.image3,
        image4: dto.image4,
        color: dto.color,
        material: dto.material,
        isAvailable: dto.isAvailable,
        isFeatured: dto.isFeatured,
        isDeal: dto.isDeal,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        sellerId: userId,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    // Handle tags
    if (dto.tags?.length) {
      for (const tagName of dto.tags) {
        const tag = await this.prisma.tag.upsert({
          where: { name: tagName.toLowerCase() },
          update: {},
          create: {
            name: tagName.toLowerCase(),
            slug: this.generateSlug(tagName),
          },
        });
        await this.prisma.productTag.create({
          data: {
            productId: product.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Update shop total products count
    if (user.shop) {
      await this.prisma.shop.update({
        where: { userId },
        data: { totalProducts: { increment: 1 } },
      });
    }

    // Clear relevant caches
    await this.cacheService.del(CacheKeys.HOMEPAGE);
    await this.cacheService.del(CacheKeys.DEALS);

    return product;
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      sort,
      isFeatured,
      isDeal,
      isNewArrival,
      inStock,
    } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = { isAvailable: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isFeatured) where.isFeatured = true;
    if (isDeal) where.isDeal = true;
    if (isNewArrival) where.isNewArrival = true;
    if (inStock) where.inStock = { gt: 0 };

    // Build sort
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating_desc':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          seller: {
            include: { profile: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string) {
    const cacheKey = CacheKeys.product(slug);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { slug, isAvailable: true },
      include: {
        category: true,
        brand: true,
        seller: {
          include: { profile: true, shop: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get related products
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isAvailable: true,
      },
      take: 6,
      include: {
        category: true,
        brand: true,
      },
    });

    const result = {
      ...product,
      relatedProducts,
    };

    await this.cacheService.set(cacheKey, result, 1800); // 30 minutes

    return result;
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only update your own products');
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        inStock: dto.inStock,
        condition: dto.condition,
        mainImage: dto.mainImage,
        image1: dto.image1,
        image2: dto.image2,
        image3: dto.image3,
        image4: dto.image4,
        color: dto.color,
        material: dto.material,
        isAvailable: dto.isAvailable,
        isFeatured: dto.isFeatured,
        isDeal: dto.isDeal,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    // Clear caches
    await this.cacheService.del(CacheKeys.product(product.slug));
    await this.cacheService.del(CacheKeys.HOMEPAGE);
    await this.cacheService.del(CacheKeys.DEALS);

    return updated;
  }

  async delete(userId: string, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only delete your own products');
      }
    }

    await this.prisma.product.update({
      where: { id },
      data: { isAvailable: false },
    });

    // Clear caches
    await this.cacheService.del(CacheKeys.product(product.slug));
    await this.cacheService.del(CacheKeys.HOMEPAGE);
    await this.cacheService.del(CacheKeys.DEALS);

    return { message: 'Product deleted successfully' };
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        color: dto.color,
        colorCode: dto.colorCode,
        design: dto.design,
        image: dto.image,
        sku: dto.sku,
        inStock: dto.inStock,
        priceAdjustment: dto.priceAdjustment,
        isDefault: dto.isDefault,
        displayOrder: dto.displayOrder,
      },
    });

    // Clear variant cache
    await this.cacheService.del(CacheKeys.productVariants(productId));
    await this.cacheService.del(CacheKeys.product(product.slug));

    return variant;
  }

  async getVariants(productId: string) {
    const cacheKey = CacheKeys.productVariants(productId);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const variants = await this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    await this.cacheService.set(cacheKey, variants, 1800);

    return variants;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async getDeals(limit: number = 20) {
    const cacheKey = CacheKeys.DEALS;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const deals = await this.prisma.product.findMany({
      where: {
        isDeal: true,
        isAvailable: true,
        discountPrice: { not: null },
        inStock: { gt: 0 },
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    await this.cacheService.set(cacheKey, deals, 300); // 5 minutes

    return deals;
  }

  async getNewArrivals(limit: number = 20) {
    const cacheKey = CacheKeys.NEW_ARRIVALS;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const newArrivals = await this.prisma.product.findMany({
      where: {
        isNewArrival: true,
        isAvailable: true,
        inStock: { gt: 0 },
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    await this.cacheService.set(cacheKey, newArrivals, 1800);

    return newArrivals;
  }

  async getFeatured(limit: number = 20) {
    const cacheKey = CacheKeys.FEATURED;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const featured = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isAvailable: true,
        inStock: { gt: 0 },
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });

    await this.cacheService.set(cacheKey, featured, 1800);

    return featured;
  }
}
