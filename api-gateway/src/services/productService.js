const http = require("http");
const { generateServiceToken } = require("../middleware/authMiddleware");
const logger = require("../config/logger");
/**
 * Direct HTTP proxy middleware for product service
 * This implementation avoids using http-proxy-middleware which can have issues
 */
const productServiceProxy = (req, res, next) => {
    const targetHost =
        process.env.PRODUCT_SERVICE_URL || "http://localhost:8082";
    const targetUrl = new URL(targetHost);

    // Log the incoming request
    logger.info(
        `[ProductProxy] ${req.method} ${req.url} -> ${targetHost}${req.url}`
    );

    // Prepare options for the proxy request
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || 8082,
        path: req.url,
        method: req.method,
        headers: {
            // Copy original headers
            ...req.headers,
            // Required for proper proxying
            host: targetUrl.host,
            // Add service token for authentication with product service
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
            `[ProductProxy] Response: ${proxyRes.statusCode} from ${req.method} ${req.url}`
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
            `[ProductProxy] Error proxying ${req.method} ${req.url}:`,
            err.message
        );

        // Only send a response if one hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({
                message: "Error connecting to product service",
                error: err.message,
            });
        }
    });

    // Handle timeout
    proxyReq.setTimeout(30000, () => {
        proxyReq.destroy();

        if (!res.headersSent) {
            console.error(
                `[ProductProxy] Request timeout for ${req.method} ${req.url}`
            );
            res.status(504).json({
                message: "Request to product service timed out",
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
            `[ProductProxy] Forwarding request body: ${bodyData.substring(
                0,
                100
            )}${bodyData.length > 100 ? "..." : ""}`
        );
    }

    // End the request
    proxyReq.end();
};

module.exports = productServiceProxy;
