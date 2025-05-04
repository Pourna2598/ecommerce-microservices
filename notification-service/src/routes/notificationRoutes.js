const express = require("express");
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    deleteNotification,
    getUnreadCount,
    getNotificationStats,
} = require("../controllers/notificationController");
const {
    extractUserFromToken,
    validateServiceToken,
    blockExternalRequests,
    admin,
} = require("../middleware/authMiddleware");

// Apply service token validation and user extraction to all routes
router.use(validateServiceToken);
router.use(extractUserFromToken);

// Routes that require authentication
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
router.get("/unread/count", getUnreadCount);

// Admin routes
router.get("/admin/stats", admin, getNotificationStats);

module.exports = router;
