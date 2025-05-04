const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Order = require("../models/Order");

// Mock the authentication middleware
jest.mock("../middleware/authMiddleware", () => ({
    protect: (req, res, next) => {
        req.user = {
            _id: new mongoose.Types.ObjectId(),
            name: "Test User",
            email: "test@example.com",
            isAdmin: false,
        };
        next();
    },
    admin: (req, res, next) => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            res.status(403);
            throw new Error("Not authorized as admin");
        }
    },
}));

// Mock RabbitMQ message publishing
jest.mock("../messaging/setup", () => ({
    publishOrderCreated: jest.fn().mockResolvedValue(true),
    publishOrderStatusUpdated: jest.fn().mockResolvedValue(true),
}));

describe("Order API", () => {
    beforeAll(async () => {
        // Connect to a test database
        const mongoUri =
            process.env.MONGODB_URI_TEST ||
            "mongodb://localhost:27017/order-service-test";
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        // Clean up and close connection
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the orders collection before each test
        await Order.deleteMany({});
    });

    describe("POST /api/orders", () => {
        it("should create a new order", async () => {
            const orderData = {
                orderItems: [
                    {
                        name: "Test Product",
                        qty: 2,
                        image: "image.jpg",
                        price: 19.99,
                        product: new mongoose.Types.ObjectId(),
                    },
                ],
                shippingAddress: {
                    address: "123 Test St",
                    city: "Test City",
                    postalCode: "12345",
                    country: "Test Country",
                },
                paymentMethod: "PayPal",
                itemsPrice: 39.98,
                taxPrice: 6.0,
                shippingPrice: 10.0,
                totalPrice: 55.98,
            };

            const response = await request(app)
                .post("/api/orders")
                .send(orderData)
                .expect("Content-Type", /json/)
                .expect(201);

            expect(response.body).toHaveProperty("_id");
            expect(response.body.orderItems).toHaveLength(1);
            expect(response.body.orderItems[0].name).toBe("Test Product");
            expect(response.body.totalPrice).toBe(55.98);
            expect(response.body.user).toBeDefined();
        });

        it("should return 400 if no order items", async () => {
            const orderData = {
                orderItems: [],
                shippingAddress: {
                    address: "123 Test St",
                    city: "Test City",
                    postalCode: "12345",
                    country: "Test Country",
                },
                paymentMethod: "PayPal",
                itemsPrice: 0,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: 0,
            };

            await request(app)
                .post("/api/orders")
                .send(orderData)
                .expect("Content-Type", /json/)
                .expect(400);
        });
    });

    describe("GET /api/orders/:id", () => {
        it("should get an order by ID", async () => {
            // Create a test order
            const order = new Order({
                user: new mongoose.Types.ObjectId(),
                orderItems: [
                    {
                        name: "Test Product",
                        qty: 2,
                        image: "image.jpg",
                        price: 19.99,
                        product: new mongoose.Types.ObjectId(),
                    },
                ],
                shippingAddress: {
                    address: "123 Test St",
                    city: "Test City",
                    postalCode: "12345",
                    country: "Test Country",
                },
                paymentMethod: "PayPal",
                itemsPrice: 39.98,
                taxPrice: 6.0,
                shippingPrice: 10.0,
                totalPrice: 55.98,
            });

            await order.save();

            // Mock the request user to match the order user
            jest.spyOn(request(app), "get").mockImplementation(() => {
                req.user._id = order.user;
                return Promise.resolve();
            });

            const response = await request(app)
                .get(`/api/orders/${order._id}`)
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body).toHaveProperty("_id", order._id.toString());
        });
    });
});
