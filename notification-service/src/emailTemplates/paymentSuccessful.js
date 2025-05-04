module.exports = (data) => {
    const user = data.user;
    const order = data.order;
    const orderItems = data.order.orderItems || [];
    const shippingAddress = data.order.shippingAddress || {};
    const formatPrice = (price) =>
        price === undefined || price === null
            ? "0.00"
            : parseFloat(price).toFixed(2);
    const itemsHtml = orderItems
        .map(
            (item) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${
                item.name || "Unknown Item"
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
                item.qty || 0
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${formatPrice(
                item.price
            )}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${formatPrice(
                (item.qty || 0) * (item.price || 0)
            )}</td>
        </tr>
    `
        )
        .join("");
    return {
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="color: #333; font-size: 1.1em;">Hi ${
                        user?.name || "Customer"
                    },</p>
                    <h2 style="color: #333; margin-bottom: 20px;">Payment Successful</h2>
                    <p style="color: #666; margin-bottom: 20px;">Your payment has been processed successfully.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Order ID:</strong> ${
                            order._id || "N/A"
                        }</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Payment ID:</strong> ${
                            data.paymentId || "N/A"
                        }</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Transaction ID:</strong> ${
                            data.transactionId || "N/A"
                        }</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Amount:</strong> ₹${parseFloat(
                            data.amount || 0
                        ).toFixed(2)}</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Status:</strong> <span style="color: #4CAF50;">Completed</span></p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <h3 style="color: #333; margin-top: 20px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #eee;">Quantity</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eee;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${formatPrice(
                            data.order.itemsPrice
                        )}</p>
                        <p style="margin: 5px 0;"><strong>Shipping:</strong> ₹${formatPrice(
                            data.order.shippingPrice
                        )}</p>
                        <p style="margin: 5px 0;"><strong>Tax:</strong> ₹${formatPrice(
                            data.order.taxPrice
                        )}</p>
                        <p style="margin: 5px 0; font-size: 1.2em;"><strong>Total:</strong> ₹${formatPrice(
                            data.order.totalPrice
                        )}</p>
                    </div>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        This is an automated message, please do not reply. If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        `,
        text: `
            Hi ${user?.name || "Customer"},
            Payment Successful
            Your payment has been processed successfully.
            Payment Details:
            Order ID: ${data.orderId || "N/A"}
            Payment ID: ${data.paymentId || "N/A"}
            Transaction ID: ${data.transactionId || "N/A"}
            Amount: ₹${parseFloat(data.amount || 0).toFixed(2)}
            Status: Completed
            Date: ${new Date().toLocaleString()}
            This is an automated message, please do not reply.`,
    };
};
