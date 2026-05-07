import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Try getting token from state/localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            // Set Authorization header for every request
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Axios Interceptor - Token applied to request:', config.url);
        } else {
            console.warn('Axios Interceptor - No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Logout user or redirect to login
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
