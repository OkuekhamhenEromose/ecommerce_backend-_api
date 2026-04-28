import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(@Request() req) {
    return this.usersService.getUserAddresses(req.user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  async addAddress(@Request() req, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(req.user.id, dto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(@Request() req, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(req.user.id, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get user dashboard data' })
  async getDashboard(@Request() req) {
    return this.usersService.getDashboard(req.user.id);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
