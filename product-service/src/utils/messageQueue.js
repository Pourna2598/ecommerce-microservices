// This is a placeholder for RabbitMQ integration
// In a real implementation, you would use a library like amqplib

const amqp = require("amqplib");
const logger = require("../config/logger");

let channel = null;

const initializeQueue = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        const exchange = "product_events";

        await channel.assertExchange(exchange, "topic", { durable: true });
        logger.info("RabbitMQ connection established");

        connection.on("error", (err) => {
            logger.error("RabbitMQ connection error:", err);
        });

        connection.on("close", () => {
            logger.warn("RabbitMQ connection closed");
        });
    } catch (error) {
        logger.error("Failed to initialize RabbitMQ:", error);
        throw error;
    }
};

const publishEvent = async (eventType, data) => {
    if (!channel) {
        await initializeQueue();
    }

    try {
        const exchange = "product_events";
        const message = Buffer.from(JSON.stringify(data));
        channel.publish(exchange, eventType, message, { persistent: true });
        logger.info(`Event published: ${eventType}`);
    } catch (error) {
        logger.error("Error publishing event:", error);
        throw error;
    }
};

module.exports = {
    initializeQueue,
    publishEvent,
};
