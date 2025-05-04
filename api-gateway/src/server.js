// Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { errorHandler } = require("./middleware/errorMiddleware");
const { apiLogger, requestId } = require("./middleware/loggingMiddleware");
const { limiter } = require("./middleware/rateLimitMiddleware");
const routes = require("./routes");
const config = require("./config/config");
const logger = require("./config/logger");

// Create Express app
const app = express();

// 1. Basic security middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS configuration

// 2. Request tracking
app.use(requestId); // Add request ID to each request

// 3. Body parsing with reasonable limits
// Use only one JSON parser to avoid conflicts
app.use(
    bodyParser.json({
        limit: "1mb",
        verify: (req, res, buf) => {
            // Store raw body for potential debugging
            req.rawBody = buf;
        },
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "1mb",
    })
);

// 4. Logging middleware
app.use(apiLogger); // Request logging
app.use(limiter); // Rate limiting

// 5. Debug middleware for auth endpoints
app.use((req, res, next) => {
    if (
        req.method === "POST" &&
        (req.path.includes("/api/users/login") ||
            req.path.includes("/api/users/register"))
    ) {
        logger.debug("Auth request:", {
            path: req.path,
            method: req.method,
            contentType: req.headers["content-type"],
        });
    }
    next();
});

// 6. Routes
app.use(routes);

// 7. Error handling
app.use(errorHandler);

// Start server
const PORT = config.port || 8000;
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info("Available endpoints:");

    // Public Routes
    logger.info("\nPublic Routes:");
    logger.info("  POST /api/users/login");
    logger.info("  POST /api/users/register");
    logger.info("  GET /api/products");
    logger.info("  GET /api/products/top");
    logger.info("  GET /api/products/:id");
    logger.info("  GET /api/health");
    logger.info("  GET /api/services/health");

    // Protected Routes
    logger.info("\nProtected Routes:");
    logger.info("  GET /api/users/profile");
    logger.info("  PUT /api/users/profile");
    logger.info("  POST /api/products/:id/reviews");
    logger.info("  GET /api/orders/myorders");
    logger.info("  GET /api/orders/:id");
    logger.info("  PUT /api/orders/:id/pay");
    logger.info("  PUT /api/orders/:id/cancel");
    logger.info("  POST /api/payments/process");
    logger.info("  GET /api/payments/:id");
    logger.info("  POST /api/payments/:id/refund");
    logger.info("  GET /api/payments/history");
    logger.info("  GET /api/notifications");
    logger.info("  GET /api/notifications/:id");
    logger.info("  PUT /api/notifications/:id/read");
    logger.info("  DELETE /api/notifications/:id");
    logger.info("  GET /api/notifications/unread/count");

    // Admin Routes
    logger.info("\nAdmin Routes:");
    logger.info("  GET /api/users");
    logger.info("  GET /api/users/:id");
    logger.info("  PUT /api/users/:id");
    logger.info("  DELETE /api/users/:id");
    logger.info("  POST /api/products");
    logger.info("  PUT /api/products/:id");
    logger.info("  DELETE /api/products/:id");
    logger.info("  GET /api/orders");
    logger.info("  PUT /api/orders/:id/status");
    logger.info("  GET /api/orders/admin/stats");
    logger.info("  GET /api/orders/user/:userId");
    logger.info("  GET /api/payments/admin/stats");
    logger.info("  GET /api/notifications/admin/stats");
    logger.info("  GET /api/products/admin/stats");
    logger.info("  GET /api/users/admin/stats");

    // Test Route
    logger.info("\nTest Route:");
    logger.info("  POST /api/direct/login");

    logger.info("\n================================================");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    // Don't exit the process in production
    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }
});
