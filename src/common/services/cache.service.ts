import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value !== undefined ? value : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    // Simple implementation - just log that this is a stub
    console.log(`delPattern for ${pattern} - implement with Redis client if needed`);
  }

  async reset(): Promise<void> {
    console.log('reset cache - implement with Redis client if needed');
  }
}