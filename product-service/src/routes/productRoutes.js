const express = require("express");
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    updateStock,
    checkStockAndUpdate,
    getTopProducts,
    getProductStats,
} = require("../controllers/productController");
const {
    extractUserFromToken,
    validateServiceToken,
    blockExternalRequests,
    admin,
} = require("../middleware/authMiddleware");

// Apply service token validation and user extraction to all routes
router.use(validateServiceToken);

router.post("/internal/check-stock", checkStockAndUpdate);

router.use(extractUserFromToken);

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/top", getTopProducts);
router.get("/admin/stats", admin, getProductStats);
router.get("/:id", getProductById);

// Protected routes (admin only)
router.post("/", admin, createProduct);
router.put("/:id", admin, updateProduct);
router.delete("/:id", admin, deleteProduct);
router.put("/:id/stock", admin, updateStock);

// Special route for order service (service-to-service communication)

// User routes
// Note: createProductReview is missing, comment out until implemented
// router.post("/:id/reviews", createProductReview);

module.exports = router;
