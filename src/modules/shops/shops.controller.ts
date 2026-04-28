import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shop' })
  async createShop(@Request() req, @Body() createShopDto: CreateShopDto) {
    return this.shopsService.createShop(req.user.id, createShopDto);
  }

  @Get('my-shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user shop' })
  async getMyShop(@Request() req) {
    return this.shopsService.getShopByUser(req.user.id);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shop' })
  async updateShop(@Request() req, @Body() updateShopDto: Partial<CreateShopDto>) {
    return this.shopsService.updateShop(req.user.id, updateShopDto);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get shop by slug' })
  async getShopBySlug(@Param('slug') slug: string) {
    return this.shopsService.getShopBySlug(slug);
  }
}
