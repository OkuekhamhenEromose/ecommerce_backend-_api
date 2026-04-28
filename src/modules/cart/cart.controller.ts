import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add/:productId')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(
    @Request() req,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    return this.cartService.addToCart(req.user.id, productId, quantity);
  }

  @Put('item/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, quantity);
  }

  @Delete('item/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}