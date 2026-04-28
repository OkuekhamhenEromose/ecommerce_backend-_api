import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService],
  exports: [CheckoutService],
})
export class CheckoutModule {}