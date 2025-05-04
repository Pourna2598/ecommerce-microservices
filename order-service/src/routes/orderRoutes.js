const express = require("express");
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getMyOrders,
    updateOrderPaymentStatus,
} = require("../controllers/orderController");
const {
    validateServiceToken,
    blockExternalRequests,
    extractUserFromToken,
    admin,
} = require("../middleware/authMiddleware");

// Apply service token validation to all routes
router.use(validateServiceToken);

// Internal service routes (service-to-service communication)
// These don't require a user token as they are for backend communication
router.get("/internal/:id", getOrderById);
router.put("/internal/:id/status", updateOrderStatus);
router.put("/internal/:id/pay", updateOrderToPaid);

// Protected user routes
router.use(extractUserFromToken);
router.post("/", createOrder);

// IMPORTANT: Put specific routes before parameterized routes
router.get("/myorders", getMyOrders);
// Public routes with parameters - these must come after specific routes
router.get("/:id", getOrderById);

// Other protected user routes
router.put("/:id/pay", updateOrderToPaid);
router.put("/:id/cancel", cancelOrder);

// Admin routes
router.use(admin);
router.get("/", getAllOrders);
router.get("/admin/stats", getOrderStats);
router.get("/user/:userId", getUserOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
