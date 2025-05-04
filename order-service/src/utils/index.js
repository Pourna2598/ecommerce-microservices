const { UnauthorizedError } = require("../errors");

/**
 * Check if the user has permissions to access a resource
 * @param {Object} requestUser - The user making the request
 * @param {String} resourceUserId - The user ID of the resource owner
 * @returns {void} - Throws an error if user doesn't have permission
 */
const checkPermissions = (requestUser, resourceUserId) => {
    // Convert to string for comparison
    const resourceUserIdStr = resourceUserId.toString();

    // Admin can access any resource
    if (requestUser.isAdmin) return;

    // Users can only access their own resources
    if (requestUser._id.toString() === resourceUserIdStr) return;

    throw new UnauthorizedError("Not authorized to access this resource");
};

/**
 * Format money value to currency string
 * @param {Number} amount - The amount to format
 * @returns {String} - Formatted currency string
 */
const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

/**
 * Generate a random order reference number
 * @returns {String} - Order reference number
 */
const generateOrderReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `ORD-${timestamp}-${random}`;
};

module.exports = {
    checkPermissions,
    formatMoney,
    generateOrderReference,
};
