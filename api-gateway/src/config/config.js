const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "8000", 10),

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your_jwt_secret",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },

    // Service discovery configuration (if used)
    serviceDiscovery: {
        enabled: process.env.SERVICE_DISCOVERY_ENABLED === "true",
        provider: process.env.SERVICE_DISCOVERY_PROVIDER || "consul",
        host: process.env.SERVICE_DISCOVERY_HOST || "localhost",
        port: parseInt(process.env.SERVICE_DISCOVERY_PORT || "8500", 10),
    },

    // Circuit breaker configuration
    circuitBreaker: {
        enabled: process.env.CIRCUIT_BREAKER_ENABLED === "true",
        failureThreshold: parseInt(
            process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || "50",
            10
        ),
        resetTimeout: parseInt(
            process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || "10000",
            10
        ),
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes (900000ms)
        max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // limit each IP to 100 requests per windowMs
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || "info",
        format: process.env.LOG_FORMAT || "combined",
    },

    // Microservices URLs and configuration
    services: {
        product: {
            url: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
            timeout: parseInt(
                process.env.PRODUCT_SERVICE_TIMEOUT || "5000",
                10
            ),
        },
        order: {
            url: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
            timeout: parseInt(process.env.ORDER_SERVICE_TIMEOUT || "5000", 10),
        },
        payment: {
            url: process.env.PAYMENT_SERVICE_URL || "http://localhost:3004",
            timeout: parseInt(
                process.env.PAYMENT_SERVICE_TIMEOUT || "5000",
                10
            ),
        },
        user: {
            url: process.env.USER_SERVICE_URL || "http://localhost:3005",
            timeout: parseInt(process.env.USER_SERVICE_TIMEOUT || "5000", 10),
        },
        notification: {
            url:
                process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006",
            timeout: parseInt(
                process.env.NOTIFICATION_SERVICE_TIMEOUT || "5000",
                10
            ),
        },
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "x-service-token",
            "x-request-id",
        ],
    },
};

module.exports = config;
