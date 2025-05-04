const amqp = require("amqplib");
const logger = require("../config/logger");
// Message broker connection URL
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const EXCHANGE_NAME = "ecommerce_events";

let channel = null;

// Initialize connection to message broker
async function connectToMessageBroker() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Create an exchange if it doesn't exist
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

        logger.info("Connected to message broker");

        // Handle connection errors
        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err);
            setTimeout(connectToMessageBroker, 5000);
        });

        connection.on("close", () => {
            logger.info("Connection to RabbitMQ closed, reconnecting...");
            setTimeout(connectToMessageBroker, 5000);
        });

        return channel;
    } catch (error) {
        logger.error("Failed to connect to message broker:", error);
        setTimeout(connectToMessageBroker, 5000);
    }
}

// Publish a message to the exchange with a routing key
async function publishMessage(routingKey, message) {
    try {
        if (!channel) {
            logger.info("Channel not initialized, connecting...");
            await connectToMessageBroker();
        }

        logger.info("Publishing message to RabbitMQ...");
        logger.info("Exchange:", EXCHANGE_NAME);
        logger.info("Routing Key:", routingKey);
        logger.info("Message:", JSON.stringify(message, null, 2));

        const messageBuffer = Buffer.from(JSON.stringify(message));
        const result = channel.publish(
            EXCHANGE_NAME,
            routingKey,
            messageBuffer,
            {
                persistent: true,
                contentType: "application/json",
            }
        );

        logger.info(" Message published successfully:", result);
        return result;
    } catch (error) {
        logger.error(` Error publishing message to ${routingKey}:`, error);
        logger.error(" Error stack:", error.stack);
        throw error;
    }
}

module.exports = {
    connectToMessageBroker,
    publishMessage,
};
