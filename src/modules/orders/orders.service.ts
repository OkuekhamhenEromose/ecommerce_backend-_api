import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  async getUserOrders(userId: string) {
    return { message: 'Orders found', userId, orders: [] };
  }
  
  async getOrderDetails(orderId: string, userId: string) {
    return { message: 'Order found', orderId, userId };
  }
}
