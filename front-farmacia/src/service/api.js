import axios from 'axios';
import { getToken } from '../pages/login/authFuntions';

const api = axios.create({
  baseURL: "http://localhost:5000",
  responseType: 'json',
  withCredentials: true,  
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = getToken();  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});



export default api;

export const loginUser = (data) => api.post('/auth/login', data);
export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getRoles = () => api.get('/auth/roles');


export const addUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);

