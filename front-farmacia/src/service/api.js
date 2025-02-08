import axios from 'axios';
import { getToken } from '../pages/login/authFuntions';

const apiUsers = axios.create({
  baseURL: "http://localhost:5000",
  responseType: 'json',
  withCredentials: true,
  timeout: 10000
});

const apiEquipos = axios.create({
  baseURL: "http://localhost:4000",
  responseType: 'json',
  withCredentials: true,
  timeout: 10000
});

const authInterceptor = (config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

apiUsers.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
apiEquipos.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

export { apiUsers, apiEquipos };


export const loginUser = (data) => apiUsers.post('/auth/login', data);
export const getUsers = () => apiUsers.get('/users');
export const deleteUser = (id) => apiUsers.delete(`/users/${id}`);
export const getRoles = () => apiUsers.get('/auth/roles');


export const addUser = (data) => apiUsers.post('/auth/register', data);
export const updateUser = (id, data) => apiUsers.put(`/users/${id}`, data);
export const getUserById = (id) => apiUsers.get(`/users/${id}`);
export const getUserProfile = () => apiUsers.get('/auth/profile');


export const getEquipos = () => apiEquipos.get('/equipos');
export const getEquipoById = (id) => apiEquipos.get(`/equipos/${id}`);
export const createEquipo = (data) => apiEquipos.post('/equipos', data);
export const deleteEquipo = (id) => apiEquipos.delete(`/equipos/${id}`);
export const updateEquipo = (id, data) => apiEquipos.put(`/equipos/${id}`, data);

export const createTeam = (data) => apiUsers.post('/teams/create', data);
export const addUsersToTeam = (data) => apiUsers.post('/teams/add-users', data);
export const getTeamsWithUsers = () => apiUsers.get('/teams/teams-with-users');
export const removeUserFromTeam = (teamId, userId) => apiUsers.delete(`/teams/remove-user/${teamId}/${userId}`);
