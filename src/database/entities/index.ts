/**
 * src/database/entities/index.ts
 * ─────────────────────────────
 * All TypeORM entities exported from a single barrel.
 * Schema mirrors the Django models.py exactly.
 */

// ─── Re-exports ───────────────────────────────────────────────────────────
export { User, UserRole }         from './user.entity';
export { Category }               from './category.entity';
export { Product }                from './product.entity';
export { Cart, CartItem }         from './cart.entity';
export { Order, OrderItem, OrderStatus, PaymentStatus } from './order.entity';