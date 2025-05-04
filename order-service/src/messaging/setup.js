const { connectToMessageBroker, publishMessage } = require("./index");
const Order = require("../models/Order");
const logger = require("../config/logger");
// Setup messaging connections and event handlers
async function setupMessaging() {
    try {
        logger.info(" Setting up order service messaging...");
        // Connect to the message broker
        await connectToMessageBroker();
        logger.info(" Connected to message broker");

        logger.info(" Order service messaging setup complete");
    } catch (error) {
        logger.error(" Failed to setup messaging:", error);
        throw error;
    }
}

async function publishOrderCreated(order) {
    logger.info(
        "Publishing order.created event:",
        JSON.stringify(
            {
                orderId: order._id.toString(),
                userId: order.user.toString(),
                userEmail: order.user.email,
                totalAmount: order.totalPrice,
                status: order.status,
            },
            null,
            2
        )
    );

    await publishMessage("order.created", {
        orderId: order._id.toString(),
        userId: order.user.toString(),
        userEmail: order.user.email,
        totalAmount: order.totalPrice,
        status: order.status,
    });
}

async function publishOrderStatusUpdated(order) {
    logger.info(
        "Publishing order.updated event:",
        JSON.stringify(
            {
                orderId: order._id.toString(),
                userId: order.user.toString(),
                status: order.status,
                isDelivered: order.isDelivered,
            },
            null,
            2
        )
    );

    await publishMessage("order.updated", {
        orderId: order._id.toString(),
        userId: order.user.toString(),
        status: order.status,
        isDelivered: order.isDelivered,
    });
}

async function publishOrderCancelled(order) {
    logger.info(
        "Publishing order.cancelled event:",
        JSON.stringify(
            {
                orderId: order._id.toString(),
                userId: order.user.toString(),
                status: order.status,
                cancellationReason: order.cancellationReason,
            },
            null,
            2
        )
    );

    await publishMessage("order.cancelled", {
        orderId: order._id.toString(),
        userId: order.user.toString(),
        status: order.status,
        cancellationReason: order.cancellationReason,
    });
}

module.exports = {
    setupMessaging,
    publishOrderCreated,
    publishOrderStatusUpdated,
    publishOrderCancelled,
};
