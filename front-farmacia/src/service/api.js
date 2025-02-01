import axios from 'axios';
import { getToken } from '../pages/login/authFuntions';

//const baseURL = "https://apigestionindicadores.sanagustin.edu.bo";
//const baseURL = "http://localhost:5000";
// Obtiene la URL desde las variables de entorno o usa la local por defecto
const baseURL =   "http://localhost:5000"|| import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
  responseType: 'json',
  withCredentials: true,
  timeout: 10000,
  
});

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

export const loginUser = (data) => api.post('/auth/login', data);