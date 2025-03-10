import axios from 'axios';

export const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    imageBaseURL: 'http://localhost:3000',
    timeout: 10000
};

const axiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: true,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for authentication
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;