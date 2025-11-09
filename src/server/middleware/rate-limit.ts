import type { Context, Next } from 'hono';
import type { Bindings } from '../types/bindings';
import { createErrorResponse, createValidationError } from '../utils/jsonapi';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator: (c: Context) => string;
  skipSuccessfulRequests: boolean;
  message: string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  keyGenerator: (c: Context) => {
    const forwarded = c.req.header('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `rate-limit:${ip}`;
  },
  skipSuccessfulRequests: false,
  message: 'För många förfrågningar. Försök igen senare.',
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const kv = c.env.RATE_LIMIT_KV;
    const key = finalConfig.keyGenerator(c);
    const now = Date.now();

    try {
      const storedData = await kv.get<RateLimitData>(key, 'json');

      let rateLimitData: RateLimitData;

      if (!storedData || storedData.resetTime <= now) {
        rateLimitData = {
          count: 1,
          resetTime: now + finalConfig.windowMs,
        };
      } else {
        if (storedData.count >= finalConfig.maxRequests) {
          const retryAfter = Math.ceil((storedData.resetTime - now) / 1000);

          return c.json(
            createErrorResponse(createValidationError(finalConfig.message)),
            429,
            {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(storedData.resetTime).toISOString(),
            },
          );
        }

        rateLimitData = {
          count: storedData.count + 1,
          resetTime: storedData.resetTime,
        };
      }

      const ttl = Math.ceil((rateLimitData.resetTime - now) / 1000);
      await kv.put(key, JSON.stringify(rateLimitData), {
        expirationTtl: ttl,
      });

      c.header('X-RateLimit-Limit', finalConfig.maxRequests.toString());
      c.header(
        'X-RateLimit-Remaining',
        Math.max(0, finalConfig.maxRequests - rateLimitData.count).toString(),
      );
      c.header(
        'X-RateLimit-Reset',
        new Date(rateLimitData.resetTime).toISOString(),
      );

      await next();

      if (finalConfig.skipSuccessfulRequests && c.res.status < 400) {
        rateLimitData.count = Math.max(0, rateLimitData.count - 1);
        await kv.put(key, JSON.stringify(rateLimitData), {
          expirationTtl: ttl,
        });
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      await next();
    }
  };
}
