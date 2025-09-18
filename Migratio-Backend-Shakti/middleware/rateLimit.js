const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require("express-rate-limit");

// Factory function to create a limiter with custom options
function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // default
    keyGenerator: (req) => ipKeyGenerator(req),
    standardHeaders: true,   // sends RateLimit-* headers
    legacyHeaders: false,    // disable X-RateLimit-* headers
    ...options,
  });
}

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter();

const authLimiter = createRateLimiter({
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

const apiLimiter = createRateLimiter({
  max: 100,
  message: 'Too many API requests, please try again later.',
});

const adminLimiter = createRateLimiter({
  max: 50,
  message: 'Too many admin requests, please try again later.',
});

const externalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many external API calls, please try again later.',
});

// Middleware to add X-RateLimit-* headers manually (if you want legacy headers)
function addRateLimitHeaders(req, res, next) {
  if (req.rateLimit) {
    const { limit, remaining, resetTime } = req.rateLimit;
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    if (resetTime instanceof Date && !isNaN(resetTime)) {
      res.setHeader("X-RateLimit-Reset", resetTime.toISOString());
    }
  }
  next();
}

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  adminLimiter,
  externalApiLimiter,
  addRateLimitHeaders,
  createRateLimiter,
};
