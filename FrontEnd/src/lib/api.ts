import axios from 'axios';

// Khởi tạo instance axios với Base URL của Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: tự động gắn Token vào mọi request (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Đổi _id thành id trong mọi response để Frontend ko cần sửa code cũ (vì mockData dùng id)
api.interceptors.response.use(
  (response) => {
    const convertId = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(convertId);
      } else if (obj !== null && typeof obj === "object") {
        if (obj._id) obj.id = obj._id;
        Object.keys(obj).forEach((key) => convertId(obj[key]));
      }
    };
    convertId(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Token missing or expired.');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
