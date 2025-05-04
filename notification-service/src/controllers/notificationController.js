const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { catchAsync } = require("../utils/errorHandler");
const { sendNotificationEmail } = require("../services/emailService");
const logger = require("../config/logger");

// User service URL
const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || "http://localhost:8081";

/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Admin
 */
const createNotification = catchAsync(async (req, res) => {
    const { userId, title, message, type, template, data, priority } = req.body;

    // Validate required fields
    if (!userId || !title || !message || !type || !template) {
        return res.status(400).json({
            status: "error",
            message:
                "Please provide userId, title, message, type, and template",
        });
    }

    // Create notification
    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        template,
        data,
        priority: priority || "normal",
        emailStatus: "pending",
    });

    // Get user email from user service
    try {
        const response = await axios.get(
            `${USER_SERVICE_URL}/api/users/${userId}`
        );
        const userEmail = response.data.email;

        // Send email notification
        await sendNotificationEmail(notification, userEmail);
    } catch (error) {
        logger.error("Error sending email notification:", error);
        // Continue even if email fails - notification is still created
    }

    res.status(201).json({
        status: "success",
        data: notification,
    });
});

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Notification.countDocuments({ user: req.user.id });
    const notifications = await Notification.find({ user: req.user.id })
        .sort("-createdAt")
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        notifications,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotificationById = catchAsync(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        return res.status(404).json({
            status: "error",
            message: "Notification not found",
        });
    }

    res.json({
        status: "success",
        data: notification,
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    // Check if user is authorized to mark this notification as read
    if (notification.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to mark this notification as read");
    }

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json(notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true, readAt: new Date() }
    );

    res.json({
        status: "success",
        message: "All notifications marked as read",
    });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    // Check if user is authorized to delete this notification
    if (notification.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to delete this notification");
    }

    await notification.remove();
    res.json({ message: "Notification removed" });
});

/**
 * @desc    Get notification statistics (admin only)
 * @route   GET /api/notifications/admin/stats
 * @access  Private/Admin
 */
const getNotificationStats = asyncHandler(async (req, res) => {
    const stats = await Notification.aggregate([
        {
            $group: {
                _id: null,
                totalNotifications: { $sum: 1 },
                unreadCount: {
                    $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] },
                },
            },
        },
    ]);

    const typeStats = await Notification.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
    ]);

    res.json({
        ...stats[0],
        typeStats,
    });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread/count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        user: req.user.id,
        read: false,
    });

    res.json({ count });
});

/**
 * @desc    Get all notifications (Admin)
 * @route   GET /api/notifications/admin
 * @access  Admin
 */
const getAllNotifications = catchAsync(async (req, res) => {
    const notifications = await Notification.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    res.json({
        status: "success",
        data: notifications,
    });
});

// Process notification from message queue
const processNotification = async (data) => {
    try {
        const { userId, type, data: notificationData } = data;

        // Get template
        const template = await templateService.getTemplateByName(type);
        if (!template) {
            throw new Error(`Template not found for type: ${type}`);
        }

        // Create notification
        const notification = new Notification({
            user: userId,
            title: template.subject,
            message: template.content,
            type,
            template: template.name,
            data: notificationData,
            priority: template.priority || "normal",
        });
        await notification.save();
        logger.info(`Notification created for user ${userId}: ${type}`);

        // Send email if template has email body
        if (template.emailBody) {
            const renderedBody = templateService.renderTemplate(
                template.emailBody,
                notificationData
            );

            await sendNotificationEmail(notification, notificationData.email);
        }

        return notification;
    } catch (error) {
        logger.error("Error processing notification:", error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    markAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationStats,
    getUnreadCount,
    getAllNotifications,
    processNotification,
};
