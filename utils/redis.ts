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

// Only create Redis instance if we have valid credentials
const redis = hasValidRedisCredentials
  ? new Redis({
      url: sanitizeUrl(process.env.UPSTASH_REDIS_REST_URL),
      token: sanitizeToken(process.env.UPSTASH_REDIS_REST_TOKEN),
    })
  : undefined;

export default redis;
