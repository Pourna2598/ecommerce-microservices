const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { limiter, authLimiter } = require("../middleware/rateLimitMiddleware");
const productServiceProxy = require("../services/productService");
const orderServiceProxy = require("../services/orderService");
const paymentServiceProxy = require("../services/paymentService");
const notificationServiceProxy = require("../services/notificationService");
const userServiceProxy = require("../services/userService");
const logger = require("../config/logger");
const bodyParser = require("body-parser");
const http = require("http");
const axios = require("axios");
const services = {
    user: process.env.USER_SERVICE_URL || "http://localhost:8081",
    product: process.env.PRODUCT_SERVICE_URL || "http://localhost:8082",
    order: process.env.ORDER_SERVICE_URL || "http://localhost:8083",
    payment: process.env.PAYMENT_SERVICE_URL || "http://localhost:8084",
    notification:
        process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8085",
};

// Create a special JSON parser for auth endpoints
const jsonParser = bodyParser.json({
    limit: "1mb",
    verify: (req, res, buf) => {
        // Store raw body for debugging
        req.rawBody = buf;
    },
});

// Health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "API Gateway",
        time: new Date().toISOString(),
    });
});

router.get("/api/services/health", async (req, res) => {
    try {
        const healthChecks = await Promise.all(
            Object.entries(services).map(async ([serviceName, url]) => {
                try {
                    const response = await axios.get(`${url}/health`);
                    return {
                        service: serviceName,
                        status: "healthy",
                        responseTime: response.headers["x-response-time"],
                        timestamp: new Date().toISOString(),
                    };
                } catch (error) {
                    return {
                        service: serviceName,
                        status: "unhealthy",
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    };
                }
            })
        );

        res.json({
            status: "ok",
            services: healthChecks,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to check service health",
            error: error.message,
        });
    }
});

// Public routes
router.post("/api/users/login", userServiceProxy);
router.post("/api/users/register", userServiceProxy);

// User routes (authenticated)
router.get("/api/users/profile", verifyToken, userServiceProxy);
router.put("/api/users/profile", verifyToken, userServiceProxy);

// Product routes (authenticated)
router.get("/api/products", verifyToken, productServiceProxy);
router.get("/api/products/top", verifyToken, productServiceProxy);
router.get("/api/products/:id", verifyToken, productServiceProxy);

// Order routes (authenticated)
router.use("/api/orders", verifyToken, orderServiceProxy);
router.get("/api/orders/myorders", verifyToken, orderServiceProxy);
router.get("/api/orders/:id", verifyToken, orderServiceProxy);
router.put("/api/orders/:id/pay", verifyToken, orderServiceProxy);
router.put("/api/orders/:id/cancel", verifyToken, orderServiceProxy);

// Payment routes (authenticated)
router.use("/api/payments", verifyToken, paymentServiceProxy);
router.post("/api/payments/process", verifyToken, paymentServiceProxy);
router.get("/api/payments/:id", verifyToken, paymentServiceProxy);
router.post("/api/payments/:id/refund", verifyToken, paymentServiceProxy);
router.get("/api/payments/history", verifyToken, paymentServiceProxy);

// Notification routes (authenticated)
router.get("/api/notifications", verifyToken, notificationServiceProxy);
router.get("/api/notifications/:id", verifyToken, notificationServiceProxy);
router.put(
    "/api/notifications/:id/read",
    verifyToken,
    notificationServiceProxy
);
router.delete("/api/notifications/:id", verifyToken, notificationServiceProxy);
router.get(
    "/api/notifications/unread/count",
    verifyToken,
    notificationServiceProxy
);

// Admin routes
router.use("/api/users", verifyToken, isAdmin, userServiceProxy);
router.get("/api/users", verifyToken, isAdmin, userServiceProxy);
router.get("/api/users/:id", verifyToken, isAdmin, userServiceProxy);
router.put("/api/users/:id", verifyToken, isAdmin, userServiceProxy);
router.delete("/api/users/:id", verifyToken, isAdmin, userServiceProxy);

// Admin product routes
router.post("/api/products", verifyToken, isAdmin, productServiceProxy);
router.put("/api/products/:id", verifyToken, isAdmin, productServiceProxy);
router.delete("/api/products/:id", verifyToken, isAdmin, productServiceProxy);

// Admin order routes
router.get("/api/orders", verifyToken, isAdmin, orderServiceProxy);
router.put("/api/orders/:id/status", verifyToken, isAdmin, orderServiceProxy);
router.get("/api/orders/admin/stats", verifyToken, isAdmin, orderServiceProxy);
router.get("/api/orders/user/:userId", verifyToken, isAdmin, orderServiceProxy);

// Admin payment routes
router.get(
    "/api/payments/admin/stats",
    verifyToken,
    isAdmin,
    paymentServiceProxy
);

// Admin notification routes
router.get(
    "/api/notifications/admin/stats",
    verifyToken,
    isAdmin,
    notificationServiceProxy
);

// Admin Stats Routes
router.get("/api/orders/admin/stats", verifyToken, isAdmin, orderServiceProxy);
router.get(
    "/api/products/admin/stats",
    verifyToken,
    isAdmin,
    productServiceProxy
);
router.get("/api/users/admin/stats", verifyToken, isAdmin, userServiceProxy);

// SPECIAL TEST ROUTE - Direct proxy without http-proxy-middleware
router.post("/api/direct/login", jsonParser, (req, res) => {
    logger.debug("Processing login request");

    const options = {
        hostname: "localhost",
        port: 8081,
        path: "/api/users/login",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-service-token":
                require("../middleware/authMiddleware").generateServiceToken(),
        },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        logger.debug(`Proxy status: ${proxyRes.statusCode}`);
        res.status(proxyRes.statusCode);

        Object.keys(proxyRes.headers).forEach((key) => {
            res.setHeader(key, proxyRes.headers[key]);
        });

        let data = "";
        proxyRes.on("data", (chunk) => {
            data += chunk;
        });

        proxyRes.on("end", () => {
            res.send(data);
        });
    });

    proxyReq.on("error", (error) => {
        logger.error("Proxy error:", error);
        res.status(500).json({
            message: "Error connecting to user service",
            error: error.message,
        });
    });

    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.write(bodyData);
    }

    proxyReq.end();
});

// Fallback route for any other API request
router.use("/api/*", (req, res) => {
    logger.warn(`Unhandled API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "API endpoint not found",
    });
});

module.exports = router;
