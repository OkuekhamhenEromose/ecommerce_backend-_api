import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);
    
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: slug,
        description: createCategoryDto.description,
        image: createCategoryDto.image,
        parentId: createCategoryDto.parentId,
        order: createCategoryDto.order || 0,
      },
    });

    await this.cacheService.delPattern('categories:*');
    return category;
  }

  async findAll(parentId?: string) {
    const cacheKey = `categories:all:${parentId || 'root'}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const where: any = { isActive: true };
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Get product counts separately
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.prisma.product.count({
          where: { categoryId: category.id, isAvailable: true },
        });
        return { ...category, productCount };
      })
    );

    await this.cacheService.set(cacheKey, categoriesWithCounts, 3600);
    return categoriesWithCounts;
  }

  async findOne(slug: string) {
    const cacheKey = `category:${slug}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get products for this category
    const products = await this.prisma.product.findMany({
      where: { categoryId: category.id, isAvailable: true },
      take: 20,
      orderBy: { rating: 'desc' },
    });

    const result = { ...category, products };

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    await this.cacheService.del(`category:${category.slug}`);
    await this.cacheService.delPattern('categories:*');
    
    return updated;
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    await this.cacheService.del(`category:${category.slug}`);
    await this.cacheService.delPattern('categories:*');
    
    return { message: 'Category deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}