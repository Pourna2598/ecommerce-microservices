module.exports = (data) => {
    const user = data.user;
    const order = data.order;
    return {
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="color: #333; font-size: 1.1em;">Hi ${
                        user?.name || "Customer"
                    },</p>
                    <h2 style="color: #333; margin-bottom: 20px;">Payment Failed</h2>
                    <p style="color: #666; margin-bottom: 20px;">We were unable to process your payment.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Order ID:</strong> ${
                            order._id || "N/A"
                        }</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Amount:</strong> ₹${parseFloat(
                            order.totalPrice || 0
                        ).toFixed(2)}</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Status:</strong> <span style="color: #f44336;">Failed</span></p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Reason:</strong> ${
                            data.reason || "Payment processing error"
                        }</p>
                        <p style="color: #666; margin-bottom: 5px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="color: #666; margin-bottom: 20px;">Please try again or contact our support team for assistance.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        This is an automated message, please do not reply. If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        `,
        text: `
            Hi ${user?.name || "Customer"},
            Payment Failed
            We were unable to process your payment.
            Payment Details:
            Order ID: ${order._id || "N/A"}
            Amount: ₹${parseFloat(order.totalPrice || 0).toFixed(2)}
            Status: Failed
            Reason: ${data.reason || "Payment processing error"}
            Date: ${new Date().toLocaleString()}
            Please try again or contact our support team for assistance.
            This is an automated message, please do not reply.`,
    };
};
