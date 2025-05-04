require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
const { connectToRabbitMQ, setupQueues } = require("./messaging");
const logger = require("./config/logger");

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Initialize RabbitMQ connection and queues
const initializeRabbitMQ = async () => {
    try {
        await connectToRabbitMQ();
        await setupQueues();
        logger.info("RabbitMQ initialization completed");
    } catch (error) {
        logger.error("Failed to initialize RabbitMQ:", error);
    }
};

// Initialize notification templates
const initializeTemplates = async () => {
    try {
        await templateService.initializeDefaultTemplates();
    } catch (error) {
        logger.error("Failed to initialize templates:", error);
    }
};

// Start the server
const PORT = process.env.PORT || 8085;
app.listen(PORT, async () => {
    logger.info(`Notification Service running on port ${PORT}`);

    // Initialize templates and RabbitMQ
    await initializeRabbitMQ();
});

module.exports = app;
