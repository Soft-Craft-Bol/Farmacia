import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";
import  Sidebar  from "../components/sidebar/SideBar";
import ProfileUser from "../pages/users/ProfileUser";


const Home = lazy(() => import("../pages/home/Home"));
const UserForm = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const FormTeams = lazy(() => import("../pages/formTeam/formTeam"));
const AllUsers = lazy(() => import("../pages/allUsers/AllUsers"));
const EquipoList = lazy(() => import("../pages/equipos/EquiposList"));
const EquipoForm = lazy(() => import("../pages/equipos/EquipoForm"));
const RolesForm = lazy(() => import("../pages/users/RolesForm"));

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/" element={<LoginUser />} />
    
    {/* Rutas privadas */}
    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
    <Route path="/userManagement" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><ProfileUser /></PrivateRoute>} />
    <Route path="/registerUser" element={<PrivateRoute><UserForm /></PrivateRoute>} />
    <Route path="/teams/register" element={<PrivateRoute><FormTeams /></PrivateRoute>} />
    <Route path="/allUsers" element={<PrivateRoute><AllUsers /></PrivateRoute>} />
    <Route path="/editUser/:id" element={<PrivateRoute><UserForm /></PrivateRoute>} />
    <Route path="/equipos/register" element={<PrivateRoute><EquipoForm /></PrivateRoute>} />
    <Route path="/equipos" element={<PrivateRoute><EquipoList /></PrivateRoute>} />
    {/* <Route path="/roles" element={<PrivateRoute allowedRoles={["Administrador"]}><RolesForm /></PrivateRoute>} /> */}
    <Route path="/roles" element={<PrivateRoute allowedRoles={["Administrador"]}><RolesForm /></PrivateRoute>} />
  </Routes>
);

export default AppRoutes;
