import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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

    return category;
  }

  async findAll(parentId?: string) {
    const where: any = { isActive: true };
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return categories;
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
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
    
    return { message: 'Category deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}