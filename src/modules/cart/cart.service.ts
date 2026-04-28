import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';
import { CacheKeys } from '../../common/utils/cache-keys';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getCart(userId: string, sessionId?: string) {
    let cart = await this.findCart(userId, sessionId);

    if (!cart) {
      cart = await this.createCart(userId, sessionId);
    }

    const cartWithItems = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    // Calculate totals
    const subtotal = cartWithItems.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const totalItems = cartWithItems.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cartWithItems,
      subtotal,
      totalItems,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto, sessionId?: string) {
    const { productId, variantId, quantity, personalizations } = dto;

    // Get product
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isAvailable: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.inStock < quantity) {
      throw new BadRequestException(`Only ${product.inStock} items available`);
    }

    // Get variant if specified
    let variant = null;
    let pricePerUnit = Number(product.discountPrice || product.price);

    if (variantId) {
      variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId, isActive: true },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (variant.inStock < quantity) {
        throw new BadRequestException(`Only ${variant.inStock} items available for this variant`);
      }

      pricePerUnit =
        Number(product.discountPrice || product.price) + Number(variant.priceAdjustment);
    }

    // Get or create cart
    let cart = await this.findCart(userId, sessionId);
    if (!cart) {
      cart = await this.createCart(userId, sessionId);
    }

    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    let cartItem;
    let message;

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const maxStock = variant ? variant.inStock : product.inStock;

      if (newQuantity > maxStock) {
        throw new BadRequestException(`Maximum quantity is ${maxStock}`);
      }

      cartItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          subtotal: pricePerUnit * newQuantity,
          personalizations,
        },
      });
      message = 'Cart updated';
    } else {
      // Create new item
      cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          pricePerUnit,
          subtotal: pricePerUnit * quantity,
          personalizations,
        },
      });
      message = 'Added to cart';
    }

    // Update cart total
    await this.updateCartTotal(cart.id);

    // Clear cart cache
    await this.cacheService.del(CacheKeys.cart(userId));
    if (sessionId) {
      await this.cacheService.del(CacheKeys.cartSession(sessionId));
    }

    return { message, cartItem };
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto, sessionId?: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true, variant: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId && cartItem.cart.sessionId !== sessionId) {
      throw new BadRequestException('You do not own this cart');
    }

    const { quantity } = dto;

    if (quantity <= 0) {
      // Remove item
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      await this.updateCartTotal(cartItem.cartId);
      return { message: 'Item removed from cart' };
    }

    // Check stock
    const maxStock = cartItem.variant ? cartItem.variant.inStock : cartItem.product.inStock;

    if (quantity > maxStock) {
      throw new BadRequestException(`Only ${maxStock} items available`);
    }

    // Update item
    const pricePerUnit = cartItem.pricePerUnit;
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        subtotal: Number(pricePerUnit) * quantity,
      },
    });

    await this.updateCartTotal(cartItem.cartId);

    // Clear cache
    await this.cacheService.del(CacheKeys.cart(userId));
    if (sessionId) {
      await this.cacheService.del(CacheKeys.cartSession(sessionId));
    }

    return { message: 'Cart updated' };
  }

  async removeCartItem(userId: string, itemId: string, sessionId?: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId && cartItem.cart.sessionId !== sessionId) {
      throw new BadRequestException('You do not own this cart');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    await this.updateCartTotal(cartItem.cartId);

    // Clear cache
    await this.cacheService.del(CacheKeys.cart(userId));
    if (sessionId) {
      await this.cacheService.del(CacheKeys.cartSession(sessionId));
    }

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string, sessionId?: string) {
    const cart = await this.findCart(userId, sessionId);

    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: 0 },
      });
    }

    // Clear cache
    await this.cacheService.del(CacheKeys.cart(userId));
    if (sessionId) {
      await this.cacheService.del(CacheKeys.cartSession(sessionId));
    }

    return { message: 'Cart cleared' };
  }

  async getCartSummary(userId: string, sessionId?: string) {
    const cart = await this.findCart(userId, sessionId);

    if (!cart) {
      return { totalItems: 0, subtotal: 0 };
    }

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    return { totalItems, subtotal };
  }

  private async findCart(userId: string, sessionId?: string) {
    if (userId) {
      return this.prisma.cart.findUnique({
        where: { userId },
      });
    }

    if (sessionId) {
      return this.prisma.cart.findFirst({
        where: { sessionId },
      });
    }

    return null;
  }

  private async createCart(userId: string, sessionId?: string) {
    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
        total: 0,
      },
    });
  }

  private async updateCartTotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
    });
  }
}
