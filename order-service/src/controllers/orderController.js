const Order = require("../models/Order");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} = require("../errors");
const { checkPermissions } = require("../utils");
const asyncHandler = require("express-async-handler");
const {
    publishOrderCreated,
    publishOrderStatusUpdated,
    publishOrderCancelled,
} = require("../messaging/setup");
const { checkAndUpdateStock } = require("../services/productService");
const logger = require("../config/logger");

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod = "Pending",
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error("No order items");
    }

    // Add default image if not provided
    const processedOrderItems = orderItems.map((item) => ({
        ...item,
        image: item.image || "https://placehold.co/600x400?text=Product+Image",
    }));

    // Check stock availability in product service
    const stockCheck = await checkAndUpdateStock(processedOrderItems);

    if (!stockCheck.success) {
        // If some products are out of stock
        if (
            stockCheck.outOfStockItems &&
            stockCheck.outOfStockItems.length > 0
        ) {
            return res.status(400).json({
                message: "Some items are out of stock",
                outOfStockItems: stockCheck.outOfStockItems,
            });
        }

        // General stock check failure
        return res.status(stockCheck.status || 400).json({
            message: stockCheck.error || "Failed to check product stock",
        });
    }

    // If stock check is successful, create the order
    const order = new Order({
        user: req.user.id || req.user._id,
        orderItems: processedOrderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        status: "pending",
    });

    const createdOrder = await order.save();

    // Add user's email to the order object before publishing the event
    const orderWithEmail = {
        ...createdOrder.toObject(),
        userEmail: req.user.email,
    };
    logger.info(`Order created for user: ${req.user.email}`);

    // Publish order created event
    await publishOrderCreated(orderWithEmail);

    res.status(201).json(createdOrder);
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Skip authorization check if user object is missing (likely an internal service call)
    if (!req.user) {
        logger.warn("No user object in request, skipping authorization check");
        return res.json(order);
    }

    // Make sure the logged-in user is either the order owner or an admin
    const userId = req.user.id || req.user._id;
    if (order.user.toString() !== userId.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error("Not authorized to view this order");
    }

    res.json(order);
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Skip authorization check if user object is missing (likely an internal service call)
    if (!req.user) {
        logger.warn("No user object in request, skipping authorization check");
    } else {
        // Check authorization
        const userId = req.user.id || req.user._id;
        if (order.user.toString() !== userId.toString() && !req.user.isAdmin) {
            res.status(403);
            throw new Error("Not authorized to update this order");
        }
    }

    // Check if order is already paid
    if (order.isPaid) {
        res.status(400);
        throw new Error("Order is already paid");
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = req.body.paymentMethod || order.paymentMethod;
    order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
    };
    order.status = "processing";

    const updatedOrder = await order.save();

    // Publish order status updated event
    await publishOrderStatusUpdated(updatedOrder);

    res.json(updatedOrder);
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("User not found in request");
    }

    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId }).sort("-createdAt");
    res.json(orders);
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const status = req.query.status || "";

    // Build filter options
    const filterOptions = {};
    if (status) {
        filterOptions.status = status;
    }

    // Get total count for pagination
    const count = await Order.countDocuments(filterOptions);

    // Get orders with pagination
    const orders = await Order.find(filterOptions)
        .sort("-createdAt")
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    logger.info(`Fetched ${orders.length} orders for page ${page}`);

    res.json({
        orders,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Validate status transition
    const validStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error("Invalid status value");
    }

    // If changing to delivered, update isDelivered and deliveredAt
    if (status === "delivered" && !order.isDelivered) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Publish order status updated event
    await publishOrderStatusUpdated(updatedOrder);
    logger.info(`Order ${order._id} status updated to ${status}`);

    res.json(updatedOrder);
});

/**
 * @desc    Cancel an order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Skip authorization check if user object is missing (likely an internal service call)
    if (!req.user) {
        logger.warn("No user object in request, skipping authorization check");
    } else {
        // Ensure user owns the order or is admin
        const userId = req.user.id || req.user._id;
        if (order.user.toString() !== userId.toString() && !req.user.isAdmin) {
            res.status(403);
            throw new Error("Not authorized to cancel this order");
        }
    }

    // Check if order can be cancelled
    if (!order.isCancellable) {
        res.status(400);
        throw new Error("This order cannot be cancelled");
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();

    // Publish order status updated event
    await publishOrderCancelled(updatedOrder);
    logger.info(`Order ${order._id} cancelled`);

    res.json(updatedOrder);
});

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/admin/stats
 * @access  Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalPrice" },
                averageOrderValue: { $avg: "$totalPrice" },
            },
        },
    ]);

    const statusStats = await Order.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    // Get recent orders (last 5 orders)
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id totalPrice status createdAt user");

    // Get user information for each order
    const ordersWithUserInfo = await Promise.all(
        recentOrders.map(async (order) => {
            try {
                const userResponse = await axios.get(
                    `${process.env.USER_SERVICE_URL}/api/users/internal/${order.user}`,
                    {
                        headers: {
                            "x-service-token": process.env.SERVICE_SECRET,
                        },
                    }
                );

                return {
                    _id: order._id,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    userId: order.user,
                    userEmail: userResponse.data.email,
                };
            } catch (error) {
                logger.error("Error fetching user info:", {
                    error: error.message,
                    userId: order.user,
                });
                return {
                    _id: order._id,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    userId: order.user,
                    userEmail: "Unknown",
                };
            }
        })
    );

    res.json({
        ...stats[0],
        statusStats,
        recentOrders: ordersWithUserInfo,
    });
});

/**
 * @desc    Get orders for a specific user
 * @route   GET /api/orders/user/:userId
 * @access  Private/Admin
 */
const getUserOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.params.userId }).sort(
        "-createdAt"
    );
    res.json(orders);
});

module.exports = {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getUserOrders,
};
