export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10) || 100,
  },
  
  payment: {
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});