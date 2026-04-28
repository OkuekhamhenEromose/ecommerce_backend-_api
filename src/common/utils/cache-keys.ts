export class CacheKeys {
  private static readonly PREFIX = 'ecommerce:';
  
  // Category cache keys
  static readonly CATEGORY_LIST = `${this.PREFIX}categories:list`;
  static readonly PARENT_CATEGORIES = `${this.PREFIX}categories:parent`;
  static category(slug: string): string {
    return `${this.PREFIX}category:${slug}`;
  }
  static categoryProducts(slug: string, page: number = 1, limit: number = 20): string {
    return `${this.PREFIX}category:${slug}:products:${page}:${limit}`;
  }
  
  // Product cache keys
  static product(slug: string): string {
    return `${this.PREFIX}product:${slug}`;
  }
  static productList(page: number = 1, limit: number = 20, filters: string = ''): string {
    return `${this.PREFIX}products:${page}:${limit}:${filters}`;
  }
  static productVariants(productId: string): string {
    return `${this.PREFIX}product:${productId}:variants`;
  }
  static productReviews(productId: string, page: number = 1): string {
    return `${this.PREFIX}product:${productId}:reviews:${page}`;
  }
  static similarProducts(productId: string): string {
    return `${this.PREFIX}product:${productId}:similar`;
  }
  
  // Homepage cache keys
  static readonly HOMEPAGE = `${this.PREFIX}homepage:data`;
  static readonly DEALS = `${this.PREFIX}deals:list`;
  static readonly NEW_ARRIVALS = `${this.PREFIX}products:new-arrivals`;
  static readonly FEATURED = `${this.PREFIX}products:featured`;
  
  // Cart cache keys
  static cart(userId: string): string {
    return `${this.PREFIX}cart:${userId}`;
  }
  static cartSession(sessionId: string): string {
    return `${this.PREFIX}cart:session:${sessionId}`;
  }
  
  // User cache keys
  static user(id: string): string {
    return `${this.PREFIX}user:${id}`;
  }
  static userProfile(userId: string): string {
    return `${this.PREFIX}user:${userId}:profile`;
  }
  static userWishlist(userId: string): string {
    return `${this.PREFIX}user:${userId}:wishlist`;
  }
  
  // Shop cache keys
  static shop(slug: string): string {
    return `${this.PREFIX}shop:${slug}`;
  }
  static shopProducts(shopSlug: string, page: number = 1): string {
    return `${this.PREFIX}shop:${shopSlug}:products:${page}`;
  }
  
  // Clear patterns
  static clearProduct(productId: string, productSlug: string): void {
    // Implementation in service
  }
}