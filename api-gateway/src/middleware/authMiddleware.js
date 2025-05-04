const jwt = require("jsonwebtoken");
const axios = require("axios");
const logger = require("../config/logger");

/**
 * Middleware to verify JWT token
 * This does a basic JWT validation without calling the user service
 */
const verifyToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

    if (!token) {
        logger.warn(
            `Auth failed: No token provided for ${req.method} ${req.originalUrl}`
        );
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request for potential use in other middleware
        req.user = {
            id: decoded.id,
            isAdmin: decoded.isAdmin || false,
        };

        logger.debug(
            `Auth success: ${req.user.id} accessing ${req.method} ${req.originalUrl}`
        );
        next();
    } catch (error) {
        logger.error(
            `Auth error: ${error.message} for ${req.method} ${req.originalUrl}`
        );

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired",
            });
        }

        return res.status(401).json({
            message: "Invalid token",
        });
    }
};

/**
 * Middleware to check if user is an admin
 * Must be used after verifyToken
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    if (!req.user.isAdmin) {
        logger.warn(
            `Admin access denied for user ${req.user.id} on ${req.originalUrl}`
        );
        return res.status(403).json({
            message: "Admin access required",
        });
    }

    logger.debug(
        `Admin access granted for ${req.user.id} on ${req.originalUrl}`
    );
    next();
};

// Validate user token and attach user info to request
const validateUserToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        logger.error("Token validation error:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Generate service token for internal service calls
const generateServiceToken = () => {
    const serviceSecret =
        process.env.SERVICE_SECRET || "api_gateway_secret_key";

    logger.info(
        "Generating service token with secret",
        serviceSecret === process.env.SERVICE_SECRET
            ? "from environment"
            : "using fallback"
    );

    return jwt.sign(
        {
            service: "api-gateway",
            type: "service",
        },
        serviceSecret,
        { expiresIn: "1h" }
    );
};

// Validate service token
const validateServiceToken = (req, res, next) => {
    try {
        const authHeader = req.headers["x-service-token"];
        if (!authHeader) {
            return res
                .status(401)
                .json({ message: "No service token provided" });
        }

        const decoded = jwt.verify(authHeader, process.env.SERVICE_SECRET);
        if (decoded.type !== "service") {
            return res.status(401).json({ message: "Invalid service token" });
        }

        next();
    } catch (error) {
        logger.error("Service token validation error:", error.message);
        res.status(401).json({ message: "Invalid service token" });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    validateUserToken,
    generateServiceToken,
    validateServiceToken,
};
