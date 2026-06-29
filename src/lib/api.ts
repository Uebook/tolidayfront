import axios from 'axios';

declare var process: {
       env: {
              NEXT_PUBLIC_API_URL?: string;
       }
};

let baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
if (baseUrl.endsWith('/')) {
       baseUrl = baseUrl.slice(0, -1);
}
if (baseUrl !== '/api' && !baseUrl.endsWith('/api')) {
       baseUrl = `${baseUrl}/api`;
}

const api = axios.create({
       baseURL: baseUrl,
       headers: {
              'Content-Type': 'application/json',
       },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
       const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
       if (token) {
              config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
});

export default api;
