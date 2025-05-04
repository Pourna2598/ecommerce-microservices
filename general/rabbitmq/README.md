# RabbitMQ Setup for E-commerce Microservices

This directory contains the configuration for the RabbitMQ message broker used by the e-commerce microservices.

## Configuration Files

-   `rabbitmq.conf`: Main configuration file for RabbitMQ
-   `definitions.json`: Pre-defined exchanges, queues, and bindings
-   `docker-compose.yml`: Docker Compose configuration for running RabbitMQ

## Exchange and Queue Structure

The messaging system uses a topic exchange named `ecommerce_events` with the following routing patterns:

-   `order.*` - Order-related events (created, updated, cancelled)
-   `payment.*` - Payment-related events (successful, failed)

Three queues are pre-configured:

1. `order-events` - Bound to the `order.*` routing pattern
2. `payment-events` - Bound to the `payment.*` routing pattern
3. `notification-events` - Bound to all events (`#`)

## Running RabbitMQ

To start the RabbitMQ service:

```bash
cd general/rabbitmq
docker-compose up -d
```

## Management UI

The RabbitMQ Management UI is available at http://localhost:15672

-   Username: admin
-   Password: admin123

## Connection Information for Microservices

Services should connect to RabbitMQ using the following URL:

-   In development: `amqp://admin:admin123@localhost:5672`
-   In Docker: `amqp://admin:admin123@rabbitmq:5672`

## Example Connection

```javascript
const amqp = require("amqplib");

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange("ecommerce_events", "topic", {
            durable: true,
        });

        // Rest of your messaging code

        return channel;
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
        setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
    }
}
```
