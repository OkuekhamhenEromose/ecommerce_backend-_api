import { Controller, Post, Body, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { InitiateCheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate checkout process' })
  async initiateCheckout(@Request() req, @Body() dto: InitiateCheckoutDto) {
    return this.checkoutService.initiateCheckout(req.user?.id, dto);
  }

  @Get('verify/:reference')
  @Public()
  @ApiOperation({ summary: 'Verify payment' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.checkoutService.verifyPayment(reference);
  }

  @Get('status/:reference')
  @Public()
  @ApiOperation({ summary: 'Get payment status' })
  async getPaymentStatus(@Param('reference') reference: string) {
    return this.checkoutService.getPaymentStatus(reference);
  }
}