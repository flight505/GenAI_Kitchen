import { Redis } from "@upstash/redis";

// Ensure URL is properly formatted
const sanitizeUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  // Trim whitespace and ensure no trailing spaces
  return url.trim();
};

// Ensure token is properly formatted
const sanitizeToken = (token: string | undefined): string | undefined => {
  if (!token) return undefined;
  return token.trim();
};

// Check if we have valid Redis credentials
const hasValidRedisCredentials = 
  !!process.env.UPSTASH_REDIS_REST_URL && 
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | undefined;

try {
  // Only create Redis instance if we have valid credentials
  if (hasValidRedisCredentials) {
    redis = new Redis({
      url: sanitizeUrl(process.env.UPSTASH_REDIS_REST_URL),
      token: sanitizeToken(process.env.UPSTASH_REDIS_REST_TOKEN),
    });
  } else {
    console.log('Redis credentials not found, rate limiting will be disabled');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  // Redis will remain undefined, app will function without rate limiting
}

export default redis;