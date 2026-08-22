import axios from 'axios';

// Axios ka ek instance banaya jisse saari API calls isi baseURL par jayengi.
// Base URL = backend ka address. .env file me VITE_API_BASE_URL hota hai, warna localhost:5000/api.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: har API call se PEHLE chalta hai.
// localStorage se token uthao aur request ke header me 'Authorization' lagao.
// Isse backend pata laga pata hai ki kaun sa user request kar raha hai (JWT authentication).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: har API response ke BAAD chalta hai.
// Agar backend 401 (unauthorized) error deta hai matlab token expire/garaj galat hai.
// Tab token/user localStorage se hatao aur user ko login page par bhej do.
api.interceptors.response.use(
  (res) => res, // Success response wapas bhejo
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; // seedha login page par redirect
      }
    }
    return Promise.reject(err); // Error ko aage bhejo taaki caller handle kare
  }
);

export default api;