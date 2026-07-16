import { Request, Response, NextFunction } from 'express';

// ── Simple in-memory rate limiter ─────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function createRateLimiter(options: {
  windowMs: number;   // milliseconds
  max: number;        // max requests per window
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (entry.count >= options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('X-RateLimit-Limit', String(options.max));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: {
          message: options.message || 'Too many requests. Please try again later.',
          retryAfterSeconds: retryAfter,
        },
      });
      return;
    }

    entry.count++;
    res.setHeader('X-RateLimit-Limit', String(options.max));
    res.setHeader('X-RateLimit-Remaining', String(options.max - entry.count));
    next();
  };
}

// General API rate limit: 200 req / 15 min per IP
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// Auth endpoints: 20 req / 15 min (brute-force protection)
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

// AI endpoints: 60 req / min
export const aiRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'AI request limit reached. Please wait a moment.',
});

// ── Input sanitization ────────────────────────────────────────────

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  // Strip null bytes and potential XSS patterns from string body fields
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/\0/g, '')                    // null bytes
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // basic script tags
        .substring(0, 100000);                 // cap field length at 100kb
    }
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, val] of Object.entries(obj)) {
        // Block __proto__, constructor, prototype pollution
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
          cleaned[key] = sanitize(val);
        }
      }
      return cleaned;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  next();
};

// ── Security headers middleware ────────────────────────────────────

export const addSecurityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};
