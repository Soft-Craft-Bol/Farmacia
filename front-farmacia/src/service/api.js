import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000",
  responseType: 'json',
  withCredentials: true,  // Esto permite el envío de cookies y sesiones
  timeout: 10000
});

export const loginUser = (data) => api.post('/auth/login', data);
