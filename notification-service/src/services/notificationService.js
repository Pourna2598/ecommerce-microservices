const Notification = require("../models/Notification");

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
    try {
        const notification = new Notification({
            user: notificationData.user,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            data: notificationData.data,
            read: false,
            priority: notificationData.priority || "normal",
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options (pagination, filters)
 * @returns {Promise<Object>} Notifications and count
 */
const getUserNotifications = async (userId, options = {}) => {
    try {
        const { page = 1, limit = 10, read, type } = options;

        const query = { user: userId };

        if (read !== undefined) {
            query.read = read;
        }

        if (type) {
            query.type = type;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Notification.countDocuments(query),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error getting user notifications:", error);
        throw error;
    }
};

/**
 * Mark notifications as read
 * @param {string} userId - The user ID
 * @param {string[]} notificationIds - Array of notification IDs to mark as read
 * @returns {Promise<Object>} Update result
 */
const markNotificationsAsRead = async (userId, notificationIds) => {
    try {
        const result = await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                user: userId,
            },
            {
                $set: {
                    read: true,
                    readAt: new Date(),
                },
            }
        );

        return result;
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
    }
};

/**
 * Delete notifications
 * @param {string} userId - The user ID
 * @param {string[]} notificationIds - Array of notification IDs to delete
 * @returns {Promise<Object>} Delete result
 */
const deleteNotifications = async (userId, notificationIds) => {
    try {
        const result = await Notification.deleteMany({
            _id: { $in: notificationIds },
            user: userId,
        });

        return result;
    } catch (error) {
        console.error("Error deleting notifications:", error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationsAsRead,
    deleteNotifications,
};
