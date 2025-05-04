const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
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

// Base URL for product service API
const PRODUCT_SERVICE_URL =
    process.env.PRODUCT_SERVICE_URL || "http://localhost:8082";

// Check if products are in stock and update stock quantities
const checkAndUpdateStock = async (orderItems) => {
    try {
        // Map order items to an array of product IDs and quantities
        const productUpdates = orderItems.map((item) => ({
            productId: item.product.toString(),
            quantity: item.qty,
        }));

        logger.info(
            `[OrderService] Checking stock for ${productUpdates.length} products`
        );

        // Make the request to the product service
        const response = await axios.post(
            `${PRODUCT_SERVICE_URL}/api/products/internal/check-stock`,
            { items: productUpdates },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-service-token": generateServiceToken(),
                },
            }
        );

        logger.info(
            `[OrderService] Stock check successful, updated ${
                response.data.updatedProducts?.length || 0
            } products`
        );

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        logger.error(
            "Error checking and updating product stock:",
            error.response?.data || error.message
        );

        // Return structured error response
        return {
            success: false,
            error:
                error.response?.data?.message ||
                "Failed to update product stock",
            status: error.response?.status || 500,
            outOfStockItems: error.response?.data?.outOfStockItems || [],
        };
    }
};

module.exports = {
    checkAndUpdateStock,
};
