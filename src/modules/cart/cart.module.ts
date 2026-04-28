import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService, CacheService],
  exports: [CartService],
})
export class CartModule {}
