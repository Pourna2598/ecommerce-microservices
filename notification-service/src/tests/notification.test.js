const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const Notification = require("../models/Notification");

// Mock RabbitMQ
jest.mock("../messaging/setup", () => ({
    setupRabbitMQ: jest.fn().mockResolvedValue(true),
}));

describe("Notification Service", () => {
    beforeAll(async () => {
        // Connect to test database
        const mongoURI =
            process.env.MONGODB_URI_TEST ||
            "mongodb://localhost:27017/notification-service-test";
        await mongoose.connect(mongoURI);
    });

    afterAll(async () => {
        // Clean up
        await Notification.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear notifications before each test
        await Notification.deleteMany({});
    });

    describe("Notification Creation", () => {
        it("should create a notification from order created event", async () => {
            const event = {
                type: "order.created",
                data: {
                    userId: new mongoose.Types.ObjectId(),
                    orderId: new mongoose.Types.ObjectId(),
                    totalAmount: 100,
                },
            };

            const notification = await Notification.create({
                user: event.data.userId,
                title: "Order Created",
                type: "order_created",
                data: {
                    orderId: event.data.orderId,
                    totalAmount: event.data.totalAmount,
                },
            });

            expect(notification).toBeDefined();
            expect(notification.title).toBe("Order Created");
            expect(notification.type).toBe("order_created");
            expect(notification.data.orderId.toString()).toBe(
                event.data.orderId.toString()
            );
        });

        it("should create a notification from payment processed event", async () => {
            const event = {
                type: "payment.processed",
                data: {
                    userId: new mongoose.Types.ObjectId(),
                    orderId: new mongoose.Types.ObjectId(),
                    amount: 100,
                    transactionId: "txn_123",
                },
            };

            const notification = await Notification.create({
                user: event.data.userId,
                title: "Payment Successful",
                type: "payment_success",
                data: {
                    orderId: event.data.orderId,
                    amount: event.data.amount,
                    transactionId: event.data.transactionId,
                },
            });

            expect(notification).toBeDefined();
            expect(notification.title).toBe("Payment Successful");
            expect(notification.type).toBe("payment_success");
            expect(notification.data.transactionId).toBe("txn_123");
        });
    });

    describe("Notification Retrieval", () => {
        it("should get notifications for a user", async () => {
            const userId = new mongoose.Types.ObjectId();

            // Create test notifications
            await Notification.create([
                {
                    user: userId,
                    title: "Test Notification 1",
                    type: "system",
                    data: { message: "Test 1" },
                },
                {
                    user: userId,
                    title: "Test Notification 2",
                    type: "system",
                    data: { message: "Test 2" },
                },
            ]);

            const response = await request(app)
                .get("/api/notifications")
                .set("Authorization", `Bearer ${generateTestToken(userId)}`)
                .expect(200);

            expect(response.body.notifications).toHaveLength(2);
        });
    });

    describe("Notification Updates", () => {
        it("should mark notifications as read", async () => {
            const userId = new mongoose.Types.ObjectId();
            const notification = await Notification.create({
                user: userId,
                title: "Test Notification",
                type: "system",
                data: { message: "Test" },
            });

            const response = await request(app)
                .put("/api/notifications/read")
                .set("Authorization", `Bearer ${generateTestToken(userId)}`)
                .send({ notificationIds: [notification._id] })
                .expect(200);

            const updatedNotification = await Notification.findById(
                notification._id
            );
            expect(updatedNotification.read).toBe(true);
            expect(updatedNotification.readAt).toBeDefined();
        });
    });
});

// Helper function to generate test JWT token
function generateTestToken(userId) {
    // This is a mock token for testing
    return "test_token";
}
