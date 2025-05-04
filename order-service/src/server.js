require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const orderRoutes = require("./routes/orderRoutes");
const { setupMessaging } = require("./messaging/setup");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const logger = require("./config/logger");
const connectDB = require("./config/database");

// If JWT_SECRET is not set, provide a default but log a warning
if (!process.env.JWT_SECRET) {
    logger.warn(
        "JWT_SECRET is not set in environment variables. Using default secret which is insecure for production."
    );
    process.env.JWT_SECRET = "default_jwt_secret_only_for_development";
}

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8083;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.originalUrl}`);

    // Log request body for POST/PUT requests
    if (req.method === "POST" || req.method === "PUT") {
        logger.debug("Request Body:", req.body);
    }

    // Capture response data
    const originalSend = res.send;
    res.send = function (body) {
        logger.http(`Response Status: ${res.statusCode}`);
        return originalSend.call(this, body);
    };

    next();
});

// Routes
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "Order Service" });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info("Connected to MongoDB");

        // Start the server
        const server = app.listen(PORT, () => {
            logger.info(`Order Service running on port ${PORT}`);
        });

        // Setup messaging
        setupMessaging().catch((err) => {
            logger.error("Failed to setup messaging:", err);
        });

        // Handle graceful shutdown
        process.on("SIGTERM", () => {
            logger.info("SIGTERM received, shutting down gracefully");
            server.close(() => {
                logger.info("Server closed");
                mongoose.connection.close(false, () => {
                    logger.info("MongoDB connection closed");
                    process.exit(0);
                });
            });
        });
    })
    .catch((err) => {
        logger.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });

module.exports = app; // For testing
