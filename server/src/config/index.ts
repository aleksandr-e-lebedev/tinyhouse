const { env } = process;

export const NODE_ENV = env.NODE_ENV || 'development';
export const PORT = env.PORT || 9000;
export const PUBLIC_URL = env.PUBLIC_URL || 'http://localhost:3000';
export const DB_URL = env.DB_URL || 'mongodb://localhost:27017/TinyHouse';

export const JWT_SECRET = env.JWT_SECRET || 'super-secure-secret-key';
export const JWT_DURATION = env.JWT_DURATION || '7d';
export const JWT_COOKIE_DURATION = env.JWT_COOKIE_DURATION || 604800000; // 7 days;

export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;

export const GOOGLE_GEOCODING_API_KEY = env.GOOGLE_GEOCODING_API_KEY;

export const STRIPE_CLIENT_ID = env.STRIPE_CLIENT_ID;
export const STRIPE_API_SECRET = env.STRIPE_API_SECRET;
