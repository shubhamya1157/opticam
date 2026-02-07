import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: "/api", // Using Vite proxy configured in vite.config.js
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
