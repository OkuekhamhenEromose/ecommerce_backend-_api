import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../../common/services/cache.service';
import { CacheKeys } from '../../common/utils/cache-keys';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getProfile(userId: string) {
    const cacheKey = CacheKeys.userProfile(userId);
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' },
        },
        shop: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    await this.cacheService.set(cacheKey, userWithoutPassword, 300); // 5 minutes

    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.username && { username: dto.username }),
        profile: {
          update: {
            fullName: dto.fullName,
            phone: dto.phone,
            bio: dto.bio,
            location: dto.location,
            gender: dto.gender,
            ...(dto.avatar && { avatar: dto.avatar }),
          },
        },
      },
      include: { profile: true },
    });

    // Invalidate cache
    await this.cacheService.del(CacheKeys.userProfile(userId));
    await this.cacheService.del(CacheKeys.user(userId));

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getUserAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId, isActive: true },
      orderBy: { isDefault: 'desc' },
    });

    return addresses;
  }

  async addAddress(userId: string, dto: any) {
    const address = await this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });

    // If this is default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: address.id } },
        data: { isDefault: false },
      });
    }

    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });

    // If this is default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return updated;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.update({
      where: { id: addressId },
      data: { isActive: false },
    });

    return { message: 'Address deleted successfully' };
  }

  async getDashboard(userId: string) {
    const [user, orders, wishlistCount, cartCount] = await Promise.all([
      this.getProfile(userId),
      this.prisma.order.count({
        where: { userId },
      }),
      this.prisma.wishlistItem.count({
        where: { wishlist: { userId } },
      }),
      this.prisma.cartItem.count({
        where: { cart: { userId } },
      }),
    ]);

    return {
      user,
      stats: {
        totalOrders: orders,
        wishlistItems: wishlistCount,
        cartItems: cartCount,
      },
    };
  }
}