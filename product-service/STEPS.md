# Product Service Implementation Steps

This document provides detailed step-by-step instructions for implementing the Product Service microservice.

## Technology Stack

- **Framework**: Node.js + Express
- **Database**: MongoDB
- **Testing**: Jest
- **Containerization**: Docker

## Prerequisites

- Node.js (v14+) and npm installed
- MongoDB installed locally or accessible MongoDB instance
- Docker installed (for containerization)
- Git for version control

## Implementation Steps

### 1. Project Setup

1. Create a new directory and initialize the Node.js project:
```bash
mkdir product-service
cd product-service
npm init -y
```

2. Install the required dependencies:
```bash
npm install express mongoose cors helmet dotenv morgan
npm install --save-dev nodemon jest supertest
```

3. Create the basic project structure:
```bash
mkdir -p src/models src/controllers src/routes src/middleware src/config src/utils
touch .env .gitignore Dockerfile docker-compose.yml
```

4. Set up `.gitignore`:
```
node_modules/
.env
coverage/
.DS_Store
```

5. Create a basic `.env` file:
```
PORT=8082
MONGODB_URI=mongodb://localhost:27017/productdb
```

### 2. Database Configuration

1. Create the MongoDB connection file in `src/config/database.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 3. Product Model

1. Create the product model in `src/models/product.model.js`:
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  categories: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
```

### 4. Authentication Middleware

1. Create an authentication verification middleware in `src/middleware/auth.middleware.js`:
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Here we would normally verify the token, but since we're using
    // microservices, the API Gateway would handle token verification.
    // This is just a placeholder for when we need to implement role-based access.
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = { verifyToken };
```

### 5. Product Controller

1. Create the product controller in `src/controllers/product.controller.js`:
```javascript
const Product = require('../models/product.model');
const { publishEvent } = require('../utils/messageQueue');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stockQuantity, categories } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      categories
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stockQuantity, categories } = req.body;
    const productId = req.params.id;
    
    // Check if product exists
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, stockQuantity, categories },
      { new: true }
    );
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { term, category, minPrice, maxPrice } = req.query;
    let query = {};
    
    // Text search if term is provided
    if (term) {
      query.$text = { $search: term };
    }
    
    // Filter by category
    if (category) {
      query.categories = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const products = await Product.find(query);
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;
    
    // Check if product exists
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate new stock quantity
    const newStockQuantity = product.stockQuantity + parseInt(quantity);
    
    // Ensure stock doesn't go negative
    if (newStockQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    // Update product stock
    product = await Product.findByIdAndUpdate(
      productId,
      { stockQuantity: newStockQuantity },
      { new: true }
    );
    
    // Publish inventory updated event for other services
    // This would be implemented in a real system with RabbitMQ
    // publishEvent('ProductStockUpdated', { productId, newQuantity: newStockQuantity });
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### 6. Message Queue Utility for Event Publishing

1. Create a utility for publishing messages to RabbitMQ in `src/utils/messageQueue.js`:
```javascript
// This is a placeholder for RabbitMQ integration
// In a real implementation, you would use a library like amqplib

exports.publishEvent = async (eventType, data) => {
  // This would be implemented with RabbitMQ
  console.log(`[Event Published] ${eventType}:`, data);
  
  // Example implementation with RabbitMQ:
  /*
  const amqp = require('amqplib');
  
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const exchange = 'product_events';
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    const message = Buffer.from(JSON.stringify(data));
    channel.publish(exchange, eventType, message, { persistent: true });
    
    console.log(`[Event Published] ${eventType}:`, data);
    
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
  */
};
```

### 7. Product Routes

1. Create product routes in `src/routes/product.routes.js`:
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Protected routes (would require authentication in a real system)
router.post('/', verifyToken, productController.createProduct);
router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);
router.put('/:id/stock', verifyToken, productController.updateStock);

module.exports = router;
```

### 8. Server Setup

1. Create the main server file in `src/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/products', require('./routes/product.routes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### 9. Update package.json Scripts

1. Update the scripts section in `package.json`:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest --detectOpenHandles"
}
```

### 10. Dockerization

1. Create a `Dockerfile`:
```Dockerfile
FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8082

CMD ["npm", "start"]
```

2. Create a `docker-compose.yml` for local development:
```yaml
version: '3'

services:
  product-service:
    build: .
    ports:
      - "8082:8082"
    environment:
      - PORT=8082
      - MONGODB_URI=mongodb://mongo:27017/productdb
    depends_on:
      - mongo
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - app-network

  mongo:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

### 11. Basic Testing Setup

1. Create a simple test file in `src/tests/product.test.js`:
```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/product.model');

describe('Product API', () => {
  beforeAll(async () => {
    // Clear the database before tests
    await Product.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect mongoose after tests
    await mongoose.connection.close();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          price: 19.99,
          stockQuantity: 100,
          categories: ['test', 'electronics']
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('Test Product');
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
```

### 12. Create Kubernetes Manifests

1. Create a directory for Kubernetes configuration:
```bash
mkdir -p kubernetes
```

2. Create a deployment manifest in `kubernetes/product-service-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: product-service:1.0
        ports:
        - containerPort: 8082
        env:
        - name: PORT
          value: "8082"
        - name: MONGODB_URI
          valueFrom:
            configMapKeyRef:
              name: db-config
              key: product-db-url
        - name: RABBITMQ_URL
          valueFrom:
            configMapKeyRef:
              name: service-urls
              key: rabbitmq-url
```

3. Create a service manifest in `kubernetes/product-service-service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
  ports:
  - port: 8082
    targetPort: 8082
  type: ClusterIP
```

### 13. RabbitMQ Integration (For Production)

1. Install amqplib for RabbitMQ:
```bash
npm install amqplib
```

2. Update the message queue utility in `src/utils/messageQueue.js` to connect to RabbitMQ:
```javascript
const amqp = require('amqplib');

const rabbitConnection = {
  connection: null,
  channel: null
};

// Set up RabbitMQ connection
const setupRabbitMQ = async () => {
  try {
    rabbitConnection.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    rabbitConnection.channel = await rabbitConnection.connection.createChannel();
    
    // Ensure the exchange exists
    const exchange = 'product_events';
    await rabbitConnection.channel.assertExchange(exchange, 'topic', { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    // Handle connection closure
    rabbitConnection.connection.on('close', () => {
      console.log('RabbitMQ connection closed, reconnecting...');
      setTimeout(setupRabbitMQ, 5000);
    });
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    setTimeout(setupRabbitMQ, 5000);
  }
};

// Publish an event to RabbitMQ
const publishEvent = async (eventType, data) => {
  try {
    if (!rabbitConnection.channel) {
      console.log('RabbitMQ not connected, skipping message');
      return;
    }
    
    const exchange = 'product_events';
    const message = Buffer.from(JSON.stringify(data));
    
    rabbitConnection.channel.publish(exchange, eventType, message, { persistent: true });
    console.log(`[Event Published] ${eventType}:`, data);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
};

module.exports = {
  setupRabbitMQ,
  publishEvent
};
```

3. Update server.js to connect to RabbitMQ on startup:
```javascript
// Add at the top with other imports
const { setupRabbitMQ } = require('./utils/messageQueue');

// Add after connecting to MongoDB
// Connect to RabbitMQ if URL is provided
if (process.env.RABBITMQ_URL) {
  setupRabbitMQ();
}
```

### 14. Run and Test

1. Start the service locally:
```bash
npm run dev
```

2. Test the API endpoints using Postman or curl:
```bash
# Create a product
curl -X POST \
  http://localhost:8082/api/products \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Smartphone",
    "description": "Latest smartphone with amazing features",
    "price": 699.99,
    "stockQuantity": 50,
    "categories": ["electronics", "phones"]
  }'

# Get all products
curl http://localhost:8082/api/products

# Search products
curl http://localhost:8082/api/products/search?term=smartphone
```

3. Run using Docker Compose:
```bash
docker-compose up -d
```

## Deployment

### Build and Deploy with Docker

1. Build the Docker image:
```bash
docker build -t product-service:1.0 .
```

2. Run the container:
```bash
docker run -p 8082:8082 -e MONGODB_URI=mongodb://host.docker.internal:27018/productdb product-service:1.0
```

### Deploy to Kubernetes (Minikube)

1. Load the Docker image into Minikube:
```bash
minikube image load product-service:1.0
```

2. Apply the Kubernetes manifests:
```bash
kubectl apply -f kubernetes/product-service-deployment.yaml
kubectl apply -f kubernetes/product-service-service.yaml
```

3. Verify the deployment:
```bash
kubectl get pods
kubectl get services
``` 