const axios = require('axios');
const { ApiError } = require('./errorHandler');
const logger = require('../config/logger');

/**
 * Service Client for making HTTP requests to microservices
 */
class ServiceClient {
    /**
     * Create a new service client
     * @param {string} serviceName - Name of the microservice
     * @param {string} baseURL - Base URL of the microservice
     * @param {number} timeout - Request timeout in milliseconds
     */
    constructor(serviceName, baseURL, timeout = 5000) {
        this.serviceName = serviceName;
        this.client = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Add request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // You can modify the request config here
                // For example, add a correlation ID
                const correlationId = config.headers['x-correlation-id'];
                logger.info(`Request to ${this.serviceName}`, {
                    service: this.serviceName,
                    method: config.method.toUpperCase(),
                    url: config.url,
                    correlationId
                });
                return config;
            },
            (error) => {
                logger.error(`Request error to ${this.serviceName}`, {
                    service: this.serviceName,
                    error: error.message
                });
                return Promise.reject(error);
            }
        );

        // Add response interceptor
        this.client.interceptors.response.use(
            (response) => {
                // You can modify the response here
                const correlationId = response.config.headers['x-correlation-id'];
                logger.info(`Response from ${this.serviceName}`, {
                    service: this.serviceName,
                    method: response.config.method.toUpperCase(),
                    url: response.config.url,
                    status: response.status,
                    correlationId
                });
                return response;
            },
            (error) => {
                const correlationId = error.config?.headers?.['x-correlation-id'];
                logger.error(`Response error from ${this.serviceName}`, {
                    service: this.serviceName,
                    method: error.config?.method?.toUpperCase(),
                    url: error.config?.url,
                    status: error.response?.status,
                    correlationId,
                    error: error.message,
                    response: error.response?.data
                });

                // Transform error to ApiError
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    const statusCode = error.response.status;
                    const message = error.response.data?.message || error.message;
                    throw new ApiError(statusCode, `Service ${this.serviceName} error: ${message}`, true, error.stack);
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new ApiError(503, `Service ${this.serviceName} unavailable`, true, error.stack);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    throw new ApiError(500, `Error connecting to service ${this.serviceName}: ${error.message}`, true, error.stack);
                }
            }
        );
    }

    /**
     * Forward the original user request headers that should be preserved
     * @param {Object} headers - Original request headers
     * @returns {Object} - Headers to forward
     */
    getForwardHeaders(headers) {
        const forwardHeaders = {};

        // Forward authentication token if present
        if (headers.authorization) {
            forwardHeaders.authorization = headers.authorization;
        }

        // Forward correlation ID for request tracing
        if (headers['x-correlation-id']) {
            forwardHeaders['x-correlation-id'] = headers['x-correlation-id'];
        }

        return forwardHeaders;
    }

    /**
     * Make a request to the microservice
     * @param {string} method - HTTP method
     * @param {string} url - URL path
     * @param {Object} data - Request body
     * @param {Object} headers - Request headers
     * @returns {Promise<Object>} - Response data
     */
    async request(method, url, data = null, headers = {}) {
        try {
            const response = await this.client.request({
                method,
                url,
                data,
                headers
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} url - URL path
     * @param {Object} headers - Request headers
     * @returns {Promise<Object>} - Response data
     */
    async get(url, headers = {}) {
        return this.request('get', url, null, headers);
    }

    /**
     * POST request
     * @param {string} url - URL path
     * @param {Object} data - Request body
     * @param {Object} headers - Request headers
     * @returns {Promise<Object>} - Response data
     */
    async post(url, data, headers = {}) {
        return this.request('post', url, data, headers);
    }

    /**
     * PUT request
     * @param {string} url - URL path
     * @param {Object} data - Request body
     * @param {Object} headers - Request headers
     * @returns {Promise<Object>} - Response data
     */
    async put(url, data, headers = {}) {
        return this.request('put', url, data, headers);
    }

    /**
     * DELETE request
     * @param {string} url - URL path
     * @param {Object} headers - Request headers
     * @returns {Promise<Object>} - Response data
     */
    async delete(url, headers = {}) {
        return this.request('delete', url, null, headers);
    }
}

module.exports = ServiceClient; 