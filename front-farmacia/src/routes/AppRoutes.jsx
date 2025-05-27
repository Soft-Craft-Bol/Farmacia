import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy } from "react";
import  Sidebar  from "../components/sidebar/SideBar";
import ProfileUser from "../pages/users/ProfileUser";
import ResetPassword from "../pages/login/ResetPassword.jsx";
import NewPassword from "../pages/login/NewPassword.jsx";


const Home = lazy(() => import("../pages/home/Home"));
const UserForm = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const FormTeams = lazy(() => import("../pages/formTeam/formTeam"));
const AllUsers = lazy(() => import("../pages/allUsers/AllUsers"));
const EquipoList = lazy(() => import("../pages/equipos/EquiposList"));
const EquipoForm = lazy(() => import("../pages/equipos/EquipoForm"));
const RolesForm = lazy(() => import("../pages/users/RolesForm"));
const TrabajoForm = lazy(() => import("../pages/users/TrabajoForm"));
const TrabajoManagement = lazy(() => import("../pages/users/TrabajoList"));
const TrabajoAddUsers = lazy(() => import("../pages/users/TrabajoAddUsers")); 
const TrabajoUserList = lazy(() => import("../pages/users/TrabajoUserList"));
const Taskboard = lazy(() => import("../pages/trabajos/TaskBoardtask.jsx"));
const CronogramaMantenimiento = lazy(() => import("../pages/cronograma/Cronograma"));
const CalendarioMantenimientos = lazy(() => import("../pages/cronograma/Calendario"));
const TrabajoPendientes = lazy(() => import("../pages/trabajos/TrabajosPendientes.jsx"));
const FinalizarTrabajoForm = lazy(() => import("../pages/trabajos/FinalizarTrabajoForm.jsx"));


const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/" element={<LoginUser />} />
    <Route path="/reset" element={<ResetPassword />} />
    <Route path="/reset-password/:token" element={<NewPassword />} />
    
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
    <Route path="/equipos/:id" element={<PrivateRoute><EquipoForm /></PrivateRoute>} />
    <Route path="/trabajos/register" element={<PrivateRoute><TrabajoForm /></PrivateRoute>} />
    <Route path="/trabajos" element={<PrivateRoute><TrabajoManagement /></PrivateRoute>} />
    <Route path="/roles" element={<PrivateRoute allowedRoles={["Administrador"]}><RolesForm /></PrivateRoute>} />
    <Route path="/trabajos/register" element={<PrivateRoute><TrabajoForm /></PrivateRoute>} />

    <Route path="/trabajos/:trabajoId/add-users" element={<PrivateRoute><TrabajoAddUsers /></PrivateRoute>} />
    <Route path="/trabajos/:trabajoId/users" element={<PrivateRoute><TrabajoUserList /></PrivateRoute>} />
    <Route path="/trabajos/taskboard" element={<PrivateRoute><Taskboard /></PrivateRoute>} />
    <Route path="/trabajos/cronograma" element={<PrivateRoute><CronogramaMantenimiento /></PrivateRoute>} />
    <Route path="/trabajos/calendario" element={<PrivateRoute><CalendarioMantenimientos /></PrivateRoute>} />
    <Route path="/trabajos/pendientes" element={<PrivateRoute><TrabajoPendientes /></PrivateRoute>} />
    <Route path="/finalizar" element={<PrivateRoute><FinalizarTrabajoForm /></PrivateRoute>} />
    
    {/* Ruta del sidebar */}
  </Routes>
);

export default AppRoutes;
