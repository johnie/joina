import type { Context, MiddlewareHandler } from 'hono';
import { createErrorResponse, createValidationError } from '../utils/jsonapi';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  limit: number; // Max requests per window
  keyGenerator: (c: Context) => string; // Function to generate unique key per client
}

// In-memory store for rate limiting
// In production, consider using Durable Objects or KV for persistence
const store: RateLimitStore = {};

/**
 * Simple rate limiter middleware for Cloudflare Workers
 * Cleans up expired entries lazily during checks
 */
export function rateLimiter(options: RateLimiterOptions): MiddlewareHandler {
  const { windowMs, limit, keyGenerator } = options;

  return async (c, next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Clean up expired entries lazily
    if (store[key] && store[key].resetAt <= now) {
      delete store[key];
    }

    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    const entry = store[key];

    // Check if limit exceeded
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', entry.resetAt.toString());
      c.header('Retry-After', retryAfter.toString());

      return c.json(
        createErrorResponse(
          createValidationError(
            'För många förfrågningar. Försök igen om några minuter.',
          ),
        ),
        429,
      );
    }

    // Increment count
    entry.count++;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', (limit - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetAt.toString());

    await next();
  };
}
