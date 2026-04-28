import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: updateUserDto.fullName,
        phone: updateUserDto.phone,
      },
    });

    if (updateUserDto.profile) {
      await this.prisma.profile.update({
        where: { userId },
        data: {
          fullname: updateUserDto.profile.fullname,
          bio: updateUserDto.profile.bio,
          location: updateUserDto.profile.location,
          gender: updateUserDto.profile.gender,
        },
      });
    }

    return this.getProfile(userId);
  }
}