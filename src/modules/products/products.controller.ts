import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateVariantDto,
} from './dto/products.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Seller only)' })
  async create(@Request() req, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'],
  })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isDeal', required: false, type: Boolean })
  @ApiQuery({ name: 'isNewArrival', required: false, type: Boolean })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('deals')
  @Public()
  @ApiOperation({ summary: 'Get products on sale' })
  async getDeals(@Query('limit') limit?: number) {
    return this.productsService.getDeals(limit || 20);
  }

  @Get('new-arrivals')
  @Public()
  @ApiOperation({ summary: 'Get new arrivals' })
  async getNewArrivals(@Query('limit') limit?: number) {
    return this.productsService.getNewArrivals(limit || 20);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.productsService.getFeatured(limit || 20);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  async delete(@Request() req, @Param('id') id: string) {
    return this.productsService.delete(req.user.id, id);
  }

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product variant' })
  async addVariant(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(productId, dto);
  }

  @Get(':productId/variants')
  @Public()
  @ApiOperation({ summary: 'Get product variants' })
  async getVariants(@Param('productId') productId: string) {
    return this.productsService.getVariants(productId);
  }
}
