# Order Service

A microservice component of the E-Commerce platform responsible for managing orders, including creation, updates, and status management.

## Overview

The Order Service provides:

-   Order creation and management
-   Order status tracking
-   Payment status management
-   Order statistics and reporting
-   Event publishing for order lifecycle events

## Prerequisites

-   Node.js 14 or higher
-   MongoDB 4.4 or higher
-   RabbitMQ 3.8 or higher
-   Docker and Docker Compose
-   Kubernetes cluster (for production)

## Quick Start

1. **Clone the Repository**

    ```bash
    git clone https://github.com/your-org/order-service.git
    cd order-service
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env` file:

    ```env
    PORT=8083
    MONGODB_URI=mongodb://localhost:27017/orderdb
    JWT_SECRET=your_jwt_secret
    RABBITMQ_URL=amqp://localhost:5672
    ```

4. **Start the Service**

    ```bash
    # Development
    npm run dev

    # Production
    npm start
    ```

## API Documentation

### Public Routes

-   `GET /api/orders/:id` - Get order by ID

### Protected User Routes

-   `POST /api/orders` - Create new order
-   `GET /api/orders/myorders` - Get user's orders
-   `PUT /api/orders/:id/pay` - Update order payment status
-   `PUT /api/orders/:id/cancel` - Cancel order

### Admin Routes

-   `GET /api/orders` - Get all orders
-   `GET /api/orders/admin/stats` - Get order statistics
-   `GET /api/orders/user/:userId` - Get orders by user ID
-   `PUT /api/orders/:id/status` - Update order status

### Internal Service Routes

-   `GET /api/orders/internal/:id` - Get order by ID (service-to-service)
-   `PUT /api/orders/internal/:id/status` - Update order status (service-to-service)
-   `PUT /api/orders/internal/:id/pay` - Update payment status (service-to-service)

### Order Status

-   `pending` - Initial state
-   `processing` - Order is being processed
-   `shipped` - Order has been shipped
-   `delivered` - Order has been delivered
-   `cancelled` - Order has been cancelled

### Order Fields

-   `user` - Reference to user
-   `orderItems` - Array of ordered items
-   `shippingAddress` - Delivery address
-   `paymentMethod` - Payment method used
-   `paymentResult` - Payment processing result
-   `itemsPrice` - Total price of items
-   `taxPrice` - Tax amount
-   `shippingPrice` - Shipping cost
-   `totalPrice` - Total order amount
-   `isPaid` - Payment status
-   `paidAt` - Payment timestamp
-   `isDelivered` - Delivery status
-   `deliveredAt` - Delivery timestamp
-   `status` - Current order status
-   `cancellationReason` - Reason for cancellation

## Event Publishing

The service publishes the following events:

-   `order.created` - When a new order is created
-   `order.updated` - When order status is updated
-   `order.cancelled` - When an order is cancelled

## Monitoring

-   Health check endpoint: `/health`
-   Request logging
-   Error tracking
-   Order statistics
-   Event publishing status

## Troubleshooting

### Common Issues

1. Database Connection Issues

    - Check MongoDB connection string
    - Verify MongoDB service is running
    - Check network connectivity

2. Message Broker Issues

    - Check RabbitMQ URL configuration
    - Verify RabbitMQ service is running
    - Check event publishing status

3. Authentication Issues
    - Verify JWT secret configuration
    - Check service token validation
    - Verify user token extraction
