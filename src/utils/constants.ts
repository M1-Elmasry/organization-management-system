/**
 * Express server host
 */
export const SERVER_HOST: string = process.env.SERVER_HOST || "127.0.0.1";

/**
 * Express server port
 */
export const SERVER_PORT: string = process.env.SERVER_PORT || "8080";

/**
 * Database host
 */
export const DB_HOST: string = process.env.DB_HOST || "127.0.0.1";

/**
 * Database port
 */
export const DB_PORT: string = process.env.DB_PORT || "27017";

/**
 * Database name
 */
export const DB_NAME: string = process.env.DB_NAME || "orgdb";

/**
 * RedisDB port
 */
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

/**
 * RedisDB port
 */
export const REDIS_PORT = process.env.REDIS_PORT || '6379';

/**
 * the secret key for access token
 */
export const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";

/**
 * the secret key for refresh token
 */
export const REFRESH_TOKEN_SECRET =
	process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret";

/**
 * expiration time of access token
 */
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";

/**
 * expiration time of access token
 */
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "1d";
