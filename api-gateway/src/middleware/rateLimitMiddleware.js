const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

// Configure rate limiting
const rateLimitOptions = {
    windowMs: eval(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
    max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Handler for when limit is reached
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            message: "Too many requests, please try again later.",
            retryAfter: Math.ceil(rateLimitOptions.windowMs / 1000), // in seconds
        });
    },

    // Custom key generator using user ID if authenticated, otherwise IP
    keyGenerator: (req) => {
        return req.user ? `user-${req.user.id}` : req.ip;
    },

    // Skip for whitelisted IPs (for testing or internal systems)
    skip: (req) => {
        const whitelistedIPs = (process.env.RATE_LIMIT_WHITELIST || "").split(
            ","
        );
        return whitelistedIPs.includes(req.ip);
    },
};

// Create rate limiter middleware
const limiter = rateLimit(rateLimitOptions);

// Create a stricter limiter for authentication endpoints
const authLimiter = rateLimit({
    ...rateLimitOptions,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit to 20 login attempts per windowMs
    message: "Too many login attempts, please try again later",
});

module.exports = {
    limiter,
    authLimiter,
};
