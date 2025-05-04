const logger = require("../config/logger");

/**
 * Middleware for handling 404 errors (not found)
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    logger.warn(`404 - ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Middleware for handling all other errors
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    logger.error(`Error in ${req.method} ${req.originalUrl}:`, {
        statusCode,
        errorMessage: err.message,
        errorName: err.name,
        errorStack:
            process.env.NODE_ENV === "development" ? err.stack : undefined,
        requestId: req.headers["x-request-id"] || "unknown",
    });

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation Error",
            details: err.message,
            path: req.path,
        });
    }

    if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
        return res.status(401).json({
            message: "Authentication Error",
            details: "Invalid or expired token",
            path: req.path,
        });
    }

    if (err.name === "BadRequestError" || err.name === "SyntaxError") {
        return res.status(400).json({
            message: "Bad Request",
            details: err.message,
            path: req.path,
        });
    }

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
        return res.status(503).json({
            message: "Service Unavailable",
            details: "The requested service is currently unavailable",
            path: req.path,
        });
    }

    if (
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNABORTED"
    ) {
        return res.status(504).json({
            message: "Gateway Timeout",
            details: "The request to the service timed out",
            path: req.path,
        });
    }

    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        path: req.path,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
