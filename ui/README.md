# E-Commerce UI

A modern, responsive web application built with React and Material-UI for the E-Commerce platform.

## Overview

The UI application provides:

-   User authentication and profile management
-   Product browsing and search
-   Shopping cart functionality
-   Order management
-   Admin dashboard
-   Responsive design for all devices

## Prerequisites

-   Node.js 14 or higher
-   npm or yarn
-   Modern web browser

## Quick Start

1. **Clone the Repository**

    ```bash
    git clone https://github.com/your-org/ecommerce-ui.git
    cd ui
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env` file:

    ```env
    VITE_API_URL=http://localhost:8080
    VITE_WS_URL=ws://localhost:8080
    ```

4. **Start the Development Server**
    ```bash
    npm run dev
    ```

## Features

### User Features

-   User registration and login
-   Profile management
-   Product browsing and search
-   Shopping cart management
-   Order placement and tracking
-   Order history

### Admin Features

-   Dashboard with analytics
-   Product management
-   Order management
-   User management
-   Inventory tracking

## Technical Stack

### Frontend

-   React 18
-   TypeScript
-   Material-UI
-   Redux Toolkit
-   React Router
-   Redux Persist

### State Management

-   Redux store with slices for:
    -   Authentication
    -   Products
    -   Cart
    -   Orders
    -   Notifications
    -   Admin
    -   User Orders

### Routing

-   Public Routes:

    -   Home
    -   Products
    -   Product Details
    -   Cart
    -   Login
    -   Register

-   Protected Routes:

    -   Profile
    -   Shipping
    -   Review
    -   Payment
    -   Place Order
    -   Order Details
    -   My Orders

-   Admin Routes:
    -   Dashboard
    -   Product List
    -   Product Edit
    -   Order List
    -   User List
    -   User Edit

## Development

### Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Reusable components
├── pages/         # Page components
├── routes/        # Route definitions
├── services/      # API services
├── store/         # Redux store
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

### Docker Deployment

1. **Build the Image**

    ```bash
    docker build -t ecommerce-ui:1.0 .
    ```

2. **Run the Container**
    ```bash
    docker run -p 80:80 \
      -e VITE_API_URL=http://api.example.com \
      -e VITE_WS_URL=ws://api.example.com \
      ecommerce-ui:1.0
    ```

### Kubernetes Deployment

1. **Create Namespace**

    ```bash
    kubectl create namespace ecommerce
    ```

2. **Apply Kubernetes Manifests**

    ```bash
    kubectl apply -f kubernetes/
    ```

3. **Verify Deployment**
    ```bash
    kubectl get all -n ecommerce -l app=ecommerce-ui
    ```

## Monitoring

-   Error tracking
-   Performance monitoring
-   User analytics
-   Console logging
-   Network request tracking

## Troubleshooting

### Common Issues

1. API Connection Issues

    - Check API URL configuration
    - Verify API service is running
    - Check network connectivity

2. Authentication Issues

    - Clear browser storage
    - Check token expiration
    - Verify API authentication

3. Performance Issues
    - Check browser console
    - Monitor network requests
    - Verify bundle size

### Debug Commands

```bash
# Check pod status
kubectl get pods -n ecommerce -l app=ecommerce-ui

# Check service logs
kubectl logs -f deployment/ecommerce-ui -n ecommerce

# Check service health
curl http://localhost:80/health
```

## License

MIT License
