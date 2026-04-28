import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const priceAtAdd = product.discountPrice || product.price;
    const subtotal = priceAtAdd * quantity;

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          subtotal: (existingItem.quantity + quantity) * priceAtAdd,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd,
          subtotal,
        },
      });
    }

    await this.updateCartTotal(cart.id);

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    const subtotal = cartItem.priceAtAdd * quantity;

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity, subtotal },
    });

    await this.updateCartTotal(cartItem.cartId);

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    await this.updateCartTotal(cartItem.cartId);

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: 0 },
      });
    }

    return { message: 'Cart cleared successfully' };
  }

  private async updateCartTotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
    });
  }
}