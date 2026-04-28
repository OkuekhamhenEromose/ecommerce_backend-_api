import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@Request() req, @Query('sessionId') sessionId?: string) {
    return this.cartService.getCart(req.user.id, sessionId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Request() req, @Body() dto: AddToCartDto, @Query('sessionId') sessionId?: string) {
    return this.cartService.addToCart(req.user.id, dto, sessionId);
  }

  @Put('item/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, dto, sessionId);
  }

  @Delete('item/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeCartItem(@Request() req, @Param('itemId') itemId: string, @Query('sessionId') sessionId?: string) {
    return this.cartService.removeCartItem(req.user.id, itemId, sessionId);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@Request() req, @Query('sessionId') sessionId?: string) {
    return this.cartService.clearCart(req.user.id, sessionId);
  }

  @Get('summary')
  @Public()
  @ApiOperation({ summary: 'Get cart summary (item count and total)' })
  async getCartSummary(@Query('userId') userId?: string, @Query('sessionId') sessionId?: string) {
    return this.cartService.getCartSummary(userId, sessionId);
  }
}