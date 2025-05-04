const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const logger = require("./config/logger");

// Load environment variables
dotenv.config();
logger.info("Product Service starting up");

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    })
);

// Increase JSON payload size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(morgan("dev"));
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/products", require("./routes/productRoutes"));

// Health check routes
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "product-service" });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "product-service" });
});

// 404 handler
app.use((req, res, next) => {
    logger.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.url}`,
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error processing ${req.method} ${req.url}: ${err.message}`);

    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (err.name === "BadRequestError") {
        return res.status(400).json({ message: "Bad Request: " + err.message });
    }

    res.status(500).json({
        message: "Internal server error",
        error: err.message,
    });
});

// Start server
const PORT = process.env.PORT || 8082;
const server = app.listen(PORT, () => {
    logger.info(`Product service running on port ${PORT}`);
});

// Handle server timeouts
server.timeout = 60000; // 60 seconds
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Graceful shutdown
process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
});

module.exports = app;
