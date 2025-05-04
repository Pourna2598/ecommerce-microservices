const logger = require('../config/logger');

/**
 * Custom error class for API Gateway
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code,
            statusCode: err.statusCode
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            correlationId: req.correlationId,
            userId: req.user?.id || 'anonymous'
        }
    });

    const statusCode = err.statusCode || 500;

    // Don't expose stack traces in production
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        correlationId: req.correlationId,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Proxy errors handling
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        errorResponse.message = 'Service is currently unavailable. Please try again later.';
        return res.status(503).json(errorResponse);
    }

    return res.status(statusCode).json(errorResponse);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
    // In a production environment, you might want to gracefully restart the application
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (error) => {
    logger.error('Uncaught Exception:', { error });
    // In a production environment, you would want to gracefully shutdown
    process.exit(1);
};

module.exports = {
    ApiError,
    errorHandler,
    handleUnhandledRejection,
    handleUncaughtException
}; 