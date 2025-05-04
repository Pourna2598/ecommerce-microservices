const http = require("http");
const { generateServiceToken } = require("../middleware/authMiddleware");
const logger = require("../config/logger");
/**
 * Direct HTTP proxy middleware for user service
 * This implementation avoids using http-proxy-middleware which has issues
 */
const userServiceProxy = (req, res, next) => {
    const targetHost = process.env.USER_SERVICE_URL || "http://localhost:8081";
    const targetUrl = new URL(targetHost);

    // Get the original URL path
    const originalPath = req.originalUrl;

    // Create the target path by preserving the full path
    // This ensures /api/users/680cfb153d0a79b290d32915 is forwarded as /api/users/680cfb153d0a79b290d32915
    const targetPath = originalPath;

    // Log the incoming request
    logger.info(
        `[UserProxy] ${req.method} ${originalPath} -> ${targetHost}${targetPath}`
    );

    // Prepare options for the proxy request
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || 8081,
        path: targetPath,
        method: req.method,
        headers: {
            // Copy original headers
            ...req.headers,
            // Required for proper proxying
            host: targetUrl.host,
            // Add service token for authentication with user service
            "x-service-token": generateServiceToken(),
        },
    };

    // Remove headers that might cause issues
    delete options.headers["connection"];
    delete options.headers["content-length"]; // We'll set this correctly if needed

    // Create the proxy request
    const proxyReq = http.request(options, (proxyRes) => {
        // Log response info
        logger.info(
            `[UserProxy] Response: ${proxyRes.statusCode} from ${req.method} ${targetPath}`
        );

        // Set status code
        res.status(proxyRes.statusCode);

        // Copy response headers
        Object.keys(proxyRes.headers).forEach((key) => {
            const value = proxyRes.headers[key];
            res.setHeader(key, value);
        });

        // Stream the response data
        proxyRes.pipe(res);
    });

    // Handle proxy request errors
    proxyReq.on("error", (err) => {
        logger.error(
            `[UserProxy] Error proxying ${req.method} ${targetPath}:`,
            err.message
        );

        // Only send a response if one hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({
                message: "Error connecting to user service",
                error: err.message,
            });
        }
    });

    // Handle timeout
    proxyReq.setTimeout(30000, () => {
        proxyReq.destroy();

        if (!res.headersSent) {
            logger.error(
                `[UserProxy] Request timeout for ${req.method} ${targetPath}`
            );
            res.status(504).json({
                message: "Request to user service timed out",
                error: "GATEWAY_TIMEOUT",
            });
        }
    });

    // If there's a request body, forward it
    if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        // Set correct content length and type
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // Write the data
        proxyReq.write(bodyData);
        logger.info(
            `[UserProxy] Forwarding request body: ${bodyData.substring(
                0,
                100
            )}${bodyData.length > 100 ? "..." : ""}`
        );
    }

    // End the request
    proxyReq.end();
};

module.exports = userServiceProxy;
