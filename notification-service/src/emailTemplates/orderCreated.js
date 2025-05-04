module.exports = (data) => {
    const user = data.user;
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
                    <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
                    <p style="color: #666; margin-bottom: 20px;">Thank you for your order! Your order has been received and is being processed.</p>
                    <h3 style="color: #333; margin-top: 20px;">Order Details</h3>
                    <p style="color: #666; margin-bottom: 5px;"><strong>Order ID:</strong> ${
                        data.order._id || data.order.orderId || "N/A"
                    }</p>
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
                    <h3 style="color: #333; margin-top: 20px;">Shipping Address</h3>
                    <p style="color: #666; margin-bottom: 5px;">${
                        shippingAddress.address || "N/A"
                    }</p>
                    <p style="color: #666; margin-bottom: 5px;">${
                        shippingAddress.city || ""
                    }, ${shippingAddress.postalCode || ""}</p>
                    <p style="color: #666; margin-bottom: 5px;">${
                        shippingAddress.country || "N/A"
                    }</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        This is an automated message, please do not reply. If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        `,
        text: `
            Hi ${user?.username || "Customer"},
            Order Confirmation
            Thank you for your order! Your order has been received and is being processed.
            Order Details:
            Order ID: ${data._id || data.orderId || "N/A"}
            Order Date: ${new Date().toLocaleDateString()}
            Order Items:
            ${orderItems
                .map(
                    (item) =>
                        `${item.name || "Unknown Item"} - Quantity: ${
                            item.qty || 0
                        } - Price: ₹${formatPrice(item.price)}`
                )
                .join("\n")}
            Order Summary:
            Subtotal: ₹${formatPrice(data.order.itemsPrice)}
            Shipping: ₹${formatPrice(data.order.shippingPrice)}
            Tax: ₹${formatPrice(data.order.taxPrice)}
            Total: ₹${formatPrice(data.order.totalPrice)}
            Shipping Address:
            ${shippingAddress.address || "N/A"}
            ${shippingAddress.city || ""}, ${shippingAddress.postalCode || ""}
            ${shippingAddress.country || "N/A"}
            This is an automated message, please do not reply.`,
    };
};
