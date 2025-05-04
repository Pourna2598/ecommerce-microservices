import axios from "axios";

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`,
            config
        );
        return config;
    },
    (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        console.log(
            `API Response: ${response.status} ${response.config.url}`,
            response.data
        );
        return response;
    },
    (error) => {
        console.error(
            "API Response Error:",
            error.response ? error.response.status : "No response",
            error.config ? error.config.url : "No URL",
            error.response ? error.response.data : error.message
        );
        // Handle session expiration
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("userToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
