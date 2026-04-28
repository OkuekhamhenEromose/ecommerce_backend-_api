import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopsService {
  async createShop(userId: string, data: any) {
    return { message: 'Shop created', userId, data };
  }
  
  async getShopByUser(userId: string) {
    return { message: 'Shop found', userId };
  }
}
