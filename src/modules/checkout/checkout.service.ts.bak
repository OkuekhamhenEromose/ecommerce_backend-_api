import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiateCheckoutDto } from './dto/checkout.dto';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async initiateCheckout(userId: string | null, dto: InitiateCheckoutDto, sessionId?: string) {
    const { address, paymentMethod, couponCode, orderNotes, cartId, localItems } = dto;

    // Get cart
    let cart = null;
    let items = [];

    if (cartId) {
      cart = await this.prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (cart) {
        items = cart.items;
      }
    }

    // If no cart items, check local items
    if (!items.length && localItems?.length) {
      items = localItems;
    }

    if (!items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock
    for (const item of items) {
      const product =
        item.product ||
        (await this.prisma.product.findUnique({
          where: { id: item.productId },
        }));

      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }

      const quantity = item.quantity;
      if (product.inStock < quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.title}`);
      }
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const price = item.pricePerUnit || item.product?.discountPrice || item.product?.price;
      subtotal += Number(price) * item.quantity;
    }

    const shippingCost = subtotal < 35 ? 4.99 : 0;
    const tax = subtotal * 0.05; // 5% tax
    let discountAmount = 0;

    // Apply discount if code provided
    if (couponCode) {
      const discount = await this.prisma.discount.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });

      if (discount && (!discount.usageLimit || discount.usedCount < discount.usageLimit)) {
        if (discount.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * Number(discount.discountValue)) / 100;
          if (discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(discount.maxDiscount));
          }
        } else if (discount.discountType === 'FIXED') {
          discountAmount = Number(discount.discountValue);
        }
      }
    }

    const amount = subtotal + shippingCost + tax - discountAmount;

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const paymentReference = uuidv4();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        fullName: address.fullName,
        email: address.email,
        phoneCountryCode: address.phoneCountryCode,
        phoneNumber: address.phoneNumber,
        country: address.country,
        streetAddress: address.streetAddress,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        subtotal,
        shippingCost,
        tax,
        discountAmount,
        amount,
        paymentMethod,
        paymentReference,
        orderNotes,
        isGift: address.isGift || false,
        giftMessage: address.giftMessage,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // Create order items
    for (const item of items) {
      const product =
        item.product ||
        (await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { seller: true },
        }));

      const pricePerUnit = item.pricePerUnit || Number(product.discountPrice || product.price);
      const subtotalItem = pricePerUnit * item.quantity;
      const platformFee = subtotalItem * 0.05;
      const sellerEarnings = subtotalItem - platformFee;

      await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          productName: product.title,
          productPrice: pricePerUnit,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          subtotal: subtotalItem,
          platformFee,
          sellerEarnings,
          personalizations: item.personalizations,
        },
      });

      // Update product stock
      await this.prisma.product.update({
        where: { id: product.id },
        data: { inStock: { decrement: item.quantity } },
      });

      // Update variant stock if applicable
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inStock: { decrement: item.quantity } },
        });
      }
    }

    // Clear cart
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: 0 },
      });
    }

    // Create platform fee record
    await this.prisma.platformFee.create({
      data: {
        orderId: order.id,
        amount: amount * 0.05,
        percentage: 5,
      },
    });

    // Create mock payment
    const payment = await this.initiateMockPayment(order.id, amount, paymentReference);

    return {
      order,
      paymentUrl: payment.authorizationUrl,
      paymentReference,
    };
  }

  private async initiateMockPayment(orderId: string, amount: number, reference: string) {
    const mockSuccess = process.env.MOCK_PAYMENT_SUCCESS === 'true';
    const mockUrl = `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`;

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        reference,
        amount,
        authorizationUrl: mockUrl,
        status: PaymentStatus.PENDING,
      },
    });

    return payment;
  }

  async verifyPayment(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Mock payment verification
    const isSuccess = process.env.MOCK_PAYMENT_SUCCESS === 'true';

    if (isSuccess) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          gatewayResponse: 'Payment successful',
        },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentComplete: true,
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
          paidAt: new Date(),
        },
      });

      // Credit seller wallets
      const orderItems = await this.prisma.orderItem.findMany({
        where: { orderId: payment.orderId },
        include: { product: { include: { seller: true } } },
      });

      const sellerEarnings: Record<string, number> = {};
      for (const item of orderItems) {
        if (item.product?.sellerId) {
          sellerEarnings[item.product.sellerId] =
            (sellerEarnings[item.product.sellerId] || 0) + Number(item.sellerEarnings);
        }
      }

      for (const [sellerId, amount] of Object.entries(sellerEarnings)) {
        let wallet = await this.prisma.wallet.findUnique({ where: { userId: sellerId } });
        if (!wallet) {
          wallet = await this.prisma.wallet.create({ data: { userId: sellerId } });
        }

        await this.prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            totalEarned: { increment: amount },
          },
        });

        await this.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount,
            type: 'credit',
            description: `Payment for Order #${payment.order.orderNumber}`,
            balanceAfter: wallet.balance + amount,
            orderId: payment.orderId,
          },
        });
      }
    }

    return { success: isSuccess, payment };
  }

  async getPaymentStatus(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      reference: payment.reference,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
      orderNumber: payment.order.orderNumber,
    };
  }
}
