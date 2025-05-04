const morgan = require("morgan");
const logger = require("../config/logger");

// Create a custom Morgan token for request ID
morgan.token("id", (req) => req.id);

// Create a custom Morgan token for user ID if available
morgan.token("user", (req) => (req.user ? req.user.id : "anonymous"));

// Create a stream object with a 'write' function for Winston
const stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

// Define log format
const format =
    ":remote-addr :method :url :status :res[content-length] - :response-time ms :user";

// Create middleware for API request logging
const apiLogger = morgan(format, {
    stream,
    // Skip logging for health check endpoints to reduce noise
    skip: (req) =>
        req.url.startsWith("/health") || req.url.startsWith("/api/health"),
});

// Create middleware to add request ID to each request
const requestId = (req, res, next) => {
    // Generate a random request ID
    req.id = Math.random().toString(36).substring(2, 15);

    // Add request ID to response headers
    res.setHeader("X-Request-ID", req.id);

    next();
};

module.exports = {
    apiLogger,
    requestId,
};
