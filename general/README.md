# E-Commerce Microservices Application

A modern, scalable e-commerce platform built using microservices architecture. This application demonstrates best practices in distributed systems, event-driven architecture, and cloud-native development.

## Architecture Overview

The application is built using a microservices architecture with the following components:

### Core Services

1. **User Service** (`user-service/`)

    - User registration and authentication
    - Profile management
    - Role-based access control
    - JWT-based authentication

2. **Product Service** (`product-service/`)

    - Product catalog management
    - Inventory tracking
    - Product search and filtering
    - Category management

3. **Order Service** (`order-service/`)

    - Order creation and management
    - Order status tracking
    - Order history
    - Integration with payment and product services

4. **Payment Service** (`payment-service/`)

    - Payment processing
    - Transaction management
    - Refund handling
    - Payment status tracking

5. **Notification Service** (`notification-service/`)

    - Email notifications
    - Order status updates
    - Payment confirmations
    - System alerts

6. **API Gateway** (`api-gateway/`)

    - Request routing
    - Authentication middleware
    - Rate limiting
    - Request/response transformation

7. **UI Application** (`ui/`)
    - React-based frontend
    - Material-UI components
    - Redux state management
    - Responsive design

### Infrastructure Components

-   **Message Broker**: RabbitMQ for asynchronous communication
-   **Databases**: MongoDB for each service
-   **Container Runtime**: Docker
-   **Orchestration**: Kubernetes

## Technology Stack

### Backend Services

-   Node.js 14+
-   Express.js
-   MongoDB
-   RabbitMQ
-   JWT Authentication
-   Docker
-   Kubernetes

### Frontend

-   React 18
-   TypeScript
-   Material-UI
-   Redux Toolkit
-   React Router
-   Vite

## Getting Started

### Prerequisites

-   Docker and Docker Compose
-   Kubernetes cluster (Minikube for local development)
-   Node.js 14+
-   MongoDB
-   RabbitMQ

### Local Development

1. **Clone the Repository**

    ```bash
    git clone https://github.com/your-org/ecommerce-microservices.git
    cd ecommerce-microservices
    ```

2. **Set Up Environment**

    ```bash
    # Copy environment files
    cp .env.example .env
    # Update environment variables as needed
    ```

3. **Start Services**
    ```bash
    # Start all services using Docker Compose
    docker-compose up -d
    ```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Service Communication

### Synchronous Communication

-   REST APIs for direct service-to-service communication
-   API Gateway for client requests
-   Service discovery for internal communication

### Asynchronous Communication

-   RabbitMQ for event-driven communication
-   Event types:
    -   `order.created`
    -   `order.updated`
    -   `order.cancelled`
    -   `payment.failure`
    -   `payment.successful`

## Database Structure

Each microservice maintains its own database:

-   **User DB**: User accounts, profiles, roles
-   **Product DB**: Products, inventory, categories
-   **Order DB**: Orders, order items, shipping details
-   **Payment DB**: Transactions, payment methods
-   **Notification DB**: Templates, notification logs

## API Documentation

Each service includes its own API documentation. See individual service READMEs for details:

-   [User Service API](user-service/README.md#api-documentation)
-   [Product Service API](product-service/README.md#api-documentation)
-   [Order Service API](order-service/README.md#api-documentation)
-   [Payment Service API](payment-service/README.md#api-documentation)
-   [Notification Service API](notification-service/README.md#api-documentation)

## Monitoring and Logging

-   Health check endpoints for each service
-   Prometheus metrics collection
-   Grafana dashboards
-   Centralized logging
-   Error tracking

## Security Features

-   JWT-based authentication
-   Role-based access control
-   API Gateway security
-   Secure communication between services
-   Environment variable management
-   Input validation
-   Rate limiting

## Development Workflow

1. **Feature Development**

    - Create feature branch
    - Implement changes
    - Write tests
    - Create pull request

2. **Testing**

    - Unit tests
    - Integration tests
    - End-to-end tests
    - Performance tests

3. **Deployment**
    - Build Docker images
    - Push to registry
    - Deploy to Kubernetes
    - Monitor deployment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, please open an issue in the repository or contact the development team.
