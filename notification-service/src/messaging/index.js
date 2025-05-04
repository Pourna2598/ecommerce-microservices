const amqplib = require("amqplib");
const {
    sendNotificationEmail,
    getTemplateContent,
} = require("../services/emailService");
const { createNotification } = require("../services/notificationService");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || "http://localhost:8081";
const ORDER_SERVICE_URL =
    process.env.ORDER_SERVICE_URL || "http://localhost:8083";
const EXCHANGE_NAME = "ecommerce_events";

let channel;

/**
 * Connect to RabbitMQ
 */
const connectToRabbitMQ = async () => {
    try {
        logger.info(" Connecting to RabbitMQ...");
        const connection = await amqplib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        logger.info(" Connected to RabbitMQ");

        // Create the exchange if it doesn't exist
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
        logger.info(" Exchange asserted:", EXCHANGE_NAME);
    } catch (error) {
        logger.error(" Failed to connect to RabbitMQ:", error);
        throw error;
    }
};

/**
 * Setup queues and consume messages
 */
const setupQueues = async () => {
    try {
        logger.info(" Setting up queues...");

        // Create a queue for this service
        const { queue } = await channel.assertQueue("", { exclusive: true });
        logger.info(" Created queue:", queue);

        // Bind the queue to the exchange for different routing patterns
        const bindings = [
            { pattern: "order.created" },
            { pattern: "order.updated" },
            { pattern: "order.cancelled" },
            { pattern: "payment.successful" },
            { pattern: "payment.failed" },
        ];

        for (const binding of bindings) {
            await channel.bindQueue(queue, EXCHANGE_NAME, binding.pattern);
            logger.info(
                " Bound queue to exchange with pattern:",
                binding.pattern
            );
        }

        // Consume messages
        channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    logger.info("Received message:", {
                        routingKey,
                        content: JSON.stringify(content, null, 2),
                    });

                    // Route the message to the appropriate handler
                    switch (routingKey) {
                        case "order.created":
                            await handleOrderCreated(content);
                            break;
                        case "order.updated":
                            await handleOrderUpdated(content);
                            break;
                        case "order.cancelled":
                            await handleOrderCancelled(content);
                            break;
                        case "payment.successful":
                            await handlePaymentSuccessful(content);
                            break;
                        case "payment.failed":
                            await handlePaymentFailed(content);
                            break;
                        default:
                            logger.warn("Unknown routing key:", routingKey);
                    }

                    channel.ack(msg);
                } catch (error) {
                    logger.error(" Error processing message:", error);
                    channel.nack(msg);
                }
            }
        });

        logger.info(" Queue setup completed");
    } catch (error) {
        logger.error(" Failed to setup queues:", error);
        throw error;
    }
};

/**
 * Handle order created event
 */
const handleOrderCreated = async (data) => {
    const { userId, orderId, totalAmount, status } = data;

    try {
        const user = await getUserDetails(userId);
        if (!user || !user.email) {
            console.error(
                `User not found or missing email for userId: ${userId}`
            );
            return;
        }
        const order = await getOrderDetails(orderId);
        if (!order || !order.status) {
            console.error(
                `Order not found or missing status for orderId: ${orderId}`
            );
            return;
        }

        logger.info(" Sending order creation email to:", user.email);

        // Create notification record
        const notification = await createNotification({
            user: userId,
            title: "Order Placed Successfully",
            message: `Your order #${orderId} has been placed successfully. Total amount: $${totalAmount}`,
            type: "order",
            priority: "normal",
            data: {
                user,
                order,
                totalAmount,
                status,
            },
        });

        await sendNotificationEmail(
            {
                title: "Order Placed Successfully",
                message: "",
                type: "order",
                template: "orderCreated",
                data: {
                    user,
                    order,
                    totalAmount,
                    status,
                },
            },
            user.email
        );
        logger.info(" Order creation email sent successfully");
    } catch (error) {
        logger.error(" Error handling order created:", error);
        logger.error(" Error stack:", error.stack);
    }
};

/**
 * Handle order updated event
 */
const handleOrderUpdated = async (data) => {
    const { userId, orderId, status, isDelivered } = data;

    try {
        const user = await getUserDetails(userId);
        if (!user || !user.email) {
            console.error(
                `User not found or missing email for userId: ${userId}`
            );
            return;
        }
        const order = await getOrderDetails(orderId);
        if (!order || !order.status) {
            console.error(
                `Order not found or missing status for orderId: ${orderId}`
            );
            return;
        }

        // Create notification record
        const notification = await createNotification({
            user: userId,
            title: "Order Status Updated",
            message: `Your order #${orderId} status has been updated to ${status}${
                isDelivered ? " and has been delivered" : ""
            }`,
            type: "order",
            priority: "normal",
            data: {
                user,
                order,
                status,
                isDelivered,
            },
        });

        await sendNotificationEmail(
            {
                title: "Order Status Updated",
                message: "",
                type: "order",
                template: "orderUpdated",
                data: {
                    user,
                    order,
                    status,
                    isDelivered,
                },
            },
            user.email
        );
    } catch (error) {
        console.error("Error handling order updated:", error);
    }
};

/**
 * Handle order cancelled event
 */
const handleOrderCancelled = async (data) => {
    const { userId, orderId, reason } = data;

    try {
        const user = await getUserDetails(userId);
        if (!user || !user.email) {
            console.error(
                `User not found or missing email for userId: ${userId}`
            );
            return;
        }
        const order = await getOrderDetails(orderId);
        if (!order || !order.status) {
            console.error(
                `Order not found or missing status for orderId: ${orderId}`
            );
            return;
        }

        // Create notification record
        const notification = await createNotification({
            user: userId,
            title: "Order Cancelled",
            message: `Your order #${orderId} has been cancelled${
                reason ? ` due to: ${reason}` : ""
            }`,
            type: "order",
            priority: "high",
            data: {
                user,
                order,
                reason,
            },
        });

        await sendNotificationEmail(
            {
                title: "Order Cancelled",
                message: "",
                type: "order",
                template: "orderCancelled",
                data: {
                    user,
                    order,
                    reason,
                },
            },
            user.email
        );
    } catch (error) {
        console.error("Error handling order cancelled:", error);
    }
};

/**
 * Handle payment successful event
 */
const handlePaymentSuccessful = async (data) => {
    const { userId, orderId, amount, paymentId, transactionId } = data;

    try {
        const user = await getUserDetails(userId);
        if (!user || !user.email) {
            console.error(
                `User not found or missing email for userId: ${userId}`
            );
            return;
        }
        const order = await getOrderDetails(orderId);
        if (!order || !order.status) {
            console.error(
                `Order not found or missing status for orderId: ${orderId}`
            );
            return;
        }

        // Create notification record
        const notification = await createNotification({
            user: userId,
            title: "Payment Successful",
            message: `Payment of $${amount} for order #${orderId} has been processed successfully. Transaction ID: ${transactionId}`,
            type: "payment",
            priority: "normal",
            data: {
                user,
                order,
                amount,
                paymentId,
                transactionId,
            },
        });

        await sendNotificationEmail(
            {
                title: "Payment Successful",
                message: "",
                type: "payment",
                template: "paymentSuccessful",
                data: {
                    user,
                    order,
                    amount,
                    paymentId,
                    transactionId,
                },
            },
            user.email
        );
    } catch (error) {
        console.error("Error handling payment successful:", error);
    }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (data) => {
    const { userId, orderId, amount, reason } = data;

    try {
        const user = await getUserDetails(userId);
        if (!user || !user.email) {
            console.error(
                `User not found or missing email for userId: ${userId}`
            );
            return;
        }
        const order = await getOrderDetails(orderId);
        if (!order || !order.status) {
            console.error(
                `Order not found or missing status for orderId: ${orderId}`
            );
            return;
        }

        // Create notification record
        const notification = await createNotification({
            user: userId,
            title: "Payment Failed",
            message: `Payment of $${amount} for order #${orderId} has failed${
                reason ? ` due to: ${reason}` : ""
            }`,
            type: "payment",
            priority: "high",
            data: {
                user,
                order,
                amount,
                reason,
            },
        });

        await sendNotificationEmail(
            {
                title: "Payment Failed",
                message: "",
                type: "payment",
                template: "paymentFailed",
                data: {
                    user,
                    order,
                    amount,
                    reason,
                },
            },
            user.email
        );
    } catch (error) {
        console.error("Error handling payment failed:", error);
    }
};

/**
 * Get user details from user service
 */
const getUserDetails = async (userId) => {
    try {
        // Generate service token
        const serviceToken = jwt.sign(
            {
                service: "notification-service",
                type: "service",
            },
            process.env.SERVICE_SECRET,
            { expiresIn: "1h" }
        );

        const response = await axios.get(
            `${USER_SERVICE_URL}/api/users/internal/${userId}`,
            {
                headers: {
                    "x-service-token": serviceToken,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error getting user details:", error);
        throw error;
    }
};

/**
 * Get order details from order service
 */
const getOrderDetails = async (orderId) => {
    try {
        // Generate service token
        const serviceToken = jwt.sign(
            {
                service: "notification-service",
                type: "service",
            },
            process.env.SERVICE_SECRET,
            { expiresIn: "1h" }
        );
        const response = await axios.get(
            `${ORDER_SERVICE_URL}/api/orders/internal/${orderId}`,
            {
                headers: {
                    "x-service-token": serviceToken,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error getting order details:", error);
        throw error;
    }
};

module.exports = {
    connectToRabbitMQ,
    setupQueues,
};
