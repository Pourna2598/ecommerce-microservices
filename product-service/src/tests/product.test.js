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