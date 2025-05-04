const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity cannot be less than 1"],
                },
                image: { type: String, required: false },
                price: {
                    type: Number,
                    required: true,
                    min: [0, "Price cannot be negative"],
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: false,
            default: null,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: [0, "Items price cannot be negative"],
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: [0, "Tax price cannot be negative"],
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: [0, "Shipping price cannot be negative"],
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
            min: [0, "Total price cannot be negative"],
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                ],
                message: "{VALUE} is not a valid order status",
            },
            default: "pending",
        },
        cancellationReason: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual field to check if order is cancellable
orderSchema.virtual("isCancellable").get(function () {
    return (
        !this.isPaid &&
        !this.isDelivered &&
        ["pending", "processing"].includes(this.status)
    );
});

// Add index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Pre-save hook to validate order items
orderSchema.pre("save", function (next) {
    if (this.orderItems && this.orderItems.length === 0) {
        const error = new Error("Order must have at least one item");
        next(error);
    }
    next();
});

// Static method to get order stats
orderSchema.statics.getOrderStats = async function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSales: { $sum: "$totalPrice" },
                avgOrderValue: { $avg: "$totalPrice" },
            },
        },
    ]);
};

// Instance method to calculate order total
orderSchema.methods.calculateTotals = function () {
    this.itemsPrice = this.orderItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );
    this.taxPrice = Number((0.15 * this.itemsPrice).toFixed(2));
    this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;
    this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;

    return this;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
