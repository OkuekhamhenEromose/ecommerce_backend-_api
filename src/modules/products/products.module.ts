import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, CacheService],
  exports: [ProductsService],
})
export class ProductsModule {}