const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const createError = require("http-errors");

// Generate a service token for internal service calls
const generateServiceToken = () => {
    const serviceSecret = process.env.SERVICE_SECRET || "service_secret_key";
    return jwt.sign(
        {
            service: "order-service",
            type: "service",
        },
        serviceSecret,
        { expiresIn: "1h" }
    );
};

/**
 * Create a new order
 * @param {Object} orderData - Contains userId, products, totalAmount, address
 */
const createOrder = async (orderData) => {
    try {
        logger.info(`[OrderService] Creating new order for user ${orderData.userId}`);

        const order = new Order({
            userId: orderData.userId,
            products: orderData.products,
            totalAmount: orderData.totalAmount,
            address: orderData.address,
            status: "Pending",
            createdAt: new Date(),
        });

        const savedOrder = await order.save();

        logger.info(`[OrderService] Order created with ID ${savedOrder._id}`);
        return {
            success: true,
            order: savedOrder,
        };
    } catch (error) {
        logger.error(`[OrderService] Error creating order: ${error.message}`);
        return {
            success: false,
            error: "Failed to create order",
        };
    }
};

/**
 * Get order by ID
 * @param {String} orderId
 */
const getOrderById = async (orderId) => {
    try {
        logger.info(`[OrderService] Fetching order by ID: ${orderId}`);

        const order = await Order.findById(orderId);
        if (!order) {
            logger.warn(`[OrderService] Order not found: ${orderId}`);
            return {
                success: false,
                error: "Order not found",
                status: 404,
            };
        }

        return {
            success: true,
            order,
        };
    } catch (error) {
        logger.error(`[OrderService] Error retrieving order: ${error.message}`);
        return {
            success: false,
            error: "Failed to retrieve order",
            status: 500,
        };
    }
};

/**
 * Cancel an order by ID
 * @param {String} orderId
 */
const cancelOrder = async (orderId) => {
    try {
        logger.info(`[OrderService] Cancelling order: ${orderId}`);

        const order = await Order.findById(orderId);
        if (!order) {
            return {
                success: false,
                error: "Order not found",
                status: 404,
            };
        }

        if (order.status === "Cancelled") {
            return {
                success: false,
                error: "Order already cancelled",
                status: 400,
            };
        }

        order.status = "Cancelled";
        order.updatedAt = new Date();
        const cancelledOrder = await order.save();

        logger.info(`[OrderService] Order cancelled: ${orderId}`);
        return {
            success: true,
            order: cancelledOrder,
        };
    } catch (error) {
        logger.error(`[OrderService] Error cancelling order: ${error.message}`);
        return {
            success: false,
            error: "Failed to cancel order",
            status: 500,
        };
    }
};

/**
 * Get all orders for a user
 * @param {String} userId
 */
const getOrdersByUser = async (userId) => {
    try {
        logger.info(`[OrderService] Fetching orders for user: ${userId}`);

        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return {
            success: true,
            orders,
        };
    } catch (error) {
        logger.error(`[OrderService] Error fetching user orders: ${error.message}`);
        return {
            success: false,
            error: "Failed to fetch user orders",
            status: 500,
        };
    }
};

/**
 * Get all orders (admin use)
 */
const getAllOrders = async () => {
    try {
        logger.info(`[OrderService] Fetching all orders`);

        const orders = await Order.find().sort({ createdAt: -1 });
        return {
            success: true,
            orders,
        };
    } catch (error) {
        logger.error(`[OrderService] Error fetching all orders: ${error.message}`);
        return {
            success: false,
            error: "Failed to fetch all orders",
            status: 500,
        };
    }
};

module.exports = {
    createOrder,
    getOrderById,
    cancelOrder,
    getOrdersByUser,
    getAllOrders,
    generateServiceToken,
};
