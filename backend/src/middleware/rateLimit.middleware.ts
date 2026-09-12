import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login, register).
 * Prevents brute-force credential stuffing and DoS attacks.
 * In test environments, the limit is raised to avoid interfering with integration tests.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // 20 attempts in prod/dev, 1000 in test
  standardHeaders: true, // Return RateLimit headers
  legacyHeaders: false,
  statusCode: 429,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
      details: null,
    },
  },
});
