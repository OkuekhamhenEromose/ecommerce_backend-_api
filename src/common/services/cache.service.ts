import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Mock implementation - does nothing
  }

  async del(key: string): Promise<void> {
    // Mock implementation - does nothing
  }

  async delPattern(pattern: string): Promise<void> {
    // Mock implementation - does nothing
  }

  async reset(): Promise<void> {
    // Mock implementation - does nothing
  }
}