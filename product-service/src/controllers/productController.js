const Product = require("../models/Product");
const { publishEvent } = require("../utils/messageQueue");
const logger = require("../config/logger");

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword || "";
        const category = req.query.category || "";
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        // Build the query
        let query = {};

        // Add keyword search if provided
        if (keyword) {
            query.name = { $regex: keyword, $options: "i" };
        }

        // Add category filter if provided (case-insensitive)
        if (category) {
            query.categories = { $regex: category, $options: "i" }; // Removed exact match
        }

        // Add price range filter if provided
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Get total count for pagination
        const count = await Product.countDocuments(query);

        // Fetch products with pagination
        const products = await Product.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        // Send response with pagination data
        const response = {
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        };

        logger.info("Sending response:", response);
        res.status(200).json(response);
    } catch (error) {
        logger.error(`Error in getAllProducts: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        logger.error(`Error in getProductById: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stockQuantity, categories } =
            req.body;

        const product = await Product.create({
            name,
            description,
            price,
            stockQuantity,
            categories,
        });

        logger.info(`Product created: ${product._id}`);
        res.status(201).json(product);
    } catch (error) {
        logger.error(`Error in createProduct: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stockQuantity, categories } =
            req.body;
        const productId = req.params.id;

        // Check if product exists
        let product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product
        product = await Product.findByIdAndUpdate(
            productId,
            { name, description, price, stockQuantity, categories },
            { new: true }
        );

        logger.info(`Product updated: ${product._id}`);
        res.status(200).json(product);
    } catch (error) {
        logger.error(`Error in updateProduct: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await Product.findByIdAndDelete(productId);
        logger.info(`Product deleted: ${productId}`);

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        logger.error(`Error in deleteProduct: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Search products
exports.searchProducts = async (req, res) => {
    try {
        const { term, category, minPrice, maxPrice } = req.query;
        const pageSize = 8; // Number of products per page
        const page = Number(req.query.pageNumber) || 1;

        let query = {};

        // Text search if term is provided
        if (term) {
            query.name = { $regex: term, $options: "i" };
        }

        // Filter by category (case-insensitive)
        if (category) {
            query.categories = {
                $regex: new RegExp("^" + category + "$", "i"),
            };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Get total count for pagination
        const count = await Product.countDocuments(query);

        // Fetch products with pagination
        const products = await Product.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        // Send response with pagination data
        res.status(200).json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        logger.error(`Error in searchProducts: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update product stock
exports.updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        const productId = req.params.id;

        // Check if product exists
        let product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Calculate new stock quantity
        const newStockQuantity = product.stockQuantity + parseInt(quantity);

        // Ensure stock doesn't go negative
        if (newStockQuantity < 0) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        // Update product stock
        product = await Product.findByIdAndUpdate(
            productId,
            { stockQuantity: newStockQuantity },
            { new: true }
        );

        // Publish inventory updated event for other services
        // This would be implemented in a real system with RabbitMQ
        // publishEvent('ProductStockUpdated', { productId, newQuantity: newStockQuantity });

        await publishEvent("ProductStockUpdated", {
            productId,
            newQuantity: newStockQuantity,
        });

        logger.info(
            `Stock updated for product ${productId}: ${newStockQuantity}`
        );
        res.status(200).json(product);
    } catch (error) {
        logger.error(`Error in updateStock: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check stock and update quantities for order items
exports.checkStockAndUpdate = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Invalid items data" });
        }

        // Step 1: Check if all products exist and have sufficient stock
        const outOfStockItems = [];
        const productsToUpdate = [];

        // Process each product in the order to check availability
        for (const item of items) {
            const { productId, quantity } = item;

            const product = await Product.findById(productId);

            // Check if product exists
            if (!product) {
                outOfStockItems.push({
                    productId,
                    reason: "Product not found",
                });
                continue;
            }

            // Check if enough stock is available
            if (product.stockQuantity < quantity) {
                outOfStockItems.push({
                    productId,
                    name: product.name,
                    requested: quantity,
                    available: product.stockQuantity,
                    reason: "Insufficient stock",
                });
                continue;
            }

            // Add to update list if all checks pass
            productsToUpdate.push({
                productId,
                quantity,
                currentStock: product.stockQuantity,
            });
        }

        // If any products are out of stock, return error
        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                message: "Some items are out of stock",
                outOfStockItems,
            });
        }

        // Step 2: Update stock quantities for all products
        const updatedProducts = [];

        // Since we're not using transactions, we have to be careful about partial updates
        // If any update fails, we should try to rollback the previous updates
        try {
            for (const item of productsToUpdate) {
                const { productId, quantity } = item;

                // Update product stock
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $inc: { stockQuantity: -quantity } },
                    { new: true }
                );

                if (!updatedProduct) {
                    throw new Error(`Failed to update product ${productId}`);
                }

                updatedProducts.push({
                    productId: updatedProduct._id,
                    name: updatedProduct.name,
                    newStockQuantity: updatedProduct.stockQuantity,
                });

                // Publish event for inventory update in a real system
                // publishEvent('ProductStockUpdated', {
                //    productId: updatedProduct._id,
                //    newQuantity: updatedProduct.stockQuantity
                // });
            }

            await publishEvent("ProductStockUpdated", {
                productIds: updatedProducts.map((p) => p.productId),
                newQuantities: updatedProducts.map((p) => p.newStockQuantity),
            });

            return res.status(200).json({
                message: "Stock checked and updated successfully",
                updatedProducts,
            });
        } catch (error) {
            // Attempt to rollback the changes we made
            console.error("Error updating stock, attempting rollback:", error);

            // Rollback logic - increase stock back for products we've already decreased
            for (const updatedProduct of updatedProducts) {
                try {
                    await Product.findByIdAndUpdate(updatedProduct.productId, {
                        $inc: {
                            stockQuantity: productsToUpdate.find(
                                (p) =>
                                    p.productId.toString() ===
                                    updatedProduct.productId.toString()
                            ).quantity,
                        },
                    });
                    logger.info(
                        `Rolled back stock change for product ${updatedProduct.productId}`
                    );
                } catch (rollbackError) {
                    console.error(
                        `Failed to rollback stock for product ${updatedProduct.productId}:`,
                        rollbackError
                    );
                }
            }

            throw error;
        }
    } catch (error) {
        logger.error(`Error in checkStockAndUpdate: ${error.message}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get top products (highly rated or featured products)
exports.getTopProducts = async (req, res) => {
    try {
        // For now, simply return the 5 most recent products
        // In a real application, this could be based on ratings, sales, etc.
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error in getTopProducts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();

        const lowStockProducts = await Product.find({
            stockQuantity: { $lt: 100 },
        })
            .select("_id name stockQuantity price")
            .sort({ stockQuantity: 1 })
            .limit(10);

        res.json({
            totalProducts,
            lowStockProducts,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product stats" });
    }
};
