module.exports = (data) => {
    const user = data.user;
    const order = data.order;
    const formatPrice = (price) =>
        price === undefined || price === null
            ? "0.00"
            : parseFloat(price).toFixed(2);
    return {
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="color: #333; font-size: 1.1em;">Hi ${
                        user?.name || "Customer"
                    },</p>
                    <h2 style="color: #333; margin-bottom: 20px;">Order Status Updated</h2>
                    <p style="color: #666; margin-bottom: 20px;">Your order status has been updated to <strong>${
                        data.status
                    }</strong>.</p>
                    <h3 style="color: #333; margin-top: 20px;">Order Details</h3>
                    <p style="color: #666; margin-bottom: 5px;"><strong>Order ID:</strong> ${
                        order._id || "N/A"
                    }</p>
                    <p style="color: #666; margin-bottom: 5px;"><strong>Status:</strong> ${
                        order.status.toUpperCase() || "N/A"
                    }</p>
                    ${
                        data.isDelivered !== undefined
                            ? `<p style="color: #666; margin-bottom: 5px;"><strong>Delivered:</strong> ${
                                  data.isDelivered ? "Yes" : "No"
                              }</p>`
                            : ""
                    }
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        This is an automated message, please do not reply. If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        `,
        text: `
            Hi ${user?.name || "Customer"},
            Order Status Updated
            Your order status has been updated to ${data.status}.
            Order Details:
            Order ID: ${order._id || "N/A"}
            Status: ${order.status || "N/A"}
            ${
                data.isDelivered !== undefined
                    ? `Delivered: ${data.isDelivered ? "Yes" : "No"}`
                    : ""
            }
            This is an automated message, please do not reply.`,
    };
};
