import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";
import  Sidebar  from "../components/sidebar/SideBar";

const Home = lazy(() => import("../pages/home/Home"));
const UserForm = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/" element={<Sidebar />} />
    
    {/* Rutas privadas */}
    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
    <Route path="/userManagement" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
    <Route path="/registerUser" element={<PrivateRoute><UserForm /></PrivateRoute>} />
    <Route path="/editUser/:id" element={<PrivateRoute><UserForm /></PrivateRoute>} />
    
  </Routes>
);

export default AppRoutes;
