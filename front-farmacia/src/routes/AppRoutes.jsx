// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute";
import LoginUser from "../pages/login/LoginUser";
import { lazy, useEffect, useState } from "react";
import ProfileUser from "../pages/users/ProfileUser";
import ResetPassword from "../pages/login/ResetPassword.jsx";
import NewPassword from "../pages/login/NewPassword.jsx";
import { getUserById } from "../service/api.js";
import { getUser } from "../pages/login/authFuntions.js";

// Lazy imports
const Home = lazy(() => import("../pages/home/Home"));
const UserForm = lazy(() => import("../pages/users/RegisterUser"));
const UserManagement = lazy(() => import("../pages/users/ListUser"));
const FormTeams = lazy(() => import("../pages/formTeam/formTeam"));
const AllUsers = lazy(() => import("../pages/allUsers/AllUsers"));
const EquipoList = lazy(() => import("../pages/equipos/EquiposList"));
const EquipoForm = lazy(() => import("../pages/equipos/EquipoForm"));
const RoleDashboard = lazy(() => import("../pages/roles/RoleDashboard"));
const TrabajoForm = lazy(() => import("../pages/users/TrabajoForm"));
const TrabajoManagement = lazy(() => import("../pages/users/TrabajoList"));
const TrabajoAddUsers = lazy(() => import("../pages/users/TrabajoAddUsers")); 
const TrabajoUserList = lazy(() => import("../pages/users/TrabajoUserList"));
const Taskboard = lazy(() => import("../pages/trabajos/TaskBoardtask.jsx"));
const CronogramaMantenimiento = lazy(() => import("../pages/cronograma/Cronograma"));
const CalendarioMantenimientos = lazy(() => import("../pages/cronograma/Calendario"));
const TrabajoPendientes = lazy(() => import("../pages/trabajos/TrabajosPendientes.jsx"));
const FinalizarTrabajoForm = lazy(() => import("../pages/trabajos/FinalizarTrabajoForm.jsx"));
const HistorialList = lazy(() => import("../pages/historial/HistorialList.jsx"));

const AppRoutes = () => {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser?.idUser) {
          const response = await getUserById(currentUser.idUser);
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [currentUser]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LoginUser />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<NewPassword />} />
      
      {/* Rutas privadas */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfileUser /></PrivateRoute>} />

      {/* 🔒 Solo con permiso "Ver Todos los Usuarios" */}
      <Route
        path="/userManagement"
        element={
          <PrivateRoute allowedPermissions={["Ver Todos los Usuarios"]}>
            <UserManagement />
          </PrivateRoute>
        }
      />

      {/* 🔒 Solo con permiso "Registrar Usuario" */}
      <Route
        path="/registerUser"
        element={
          <PrivateRoute allowedPermissions={["Registrar Usuario"]}>
            <UserForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/equipos/register"
        element={
          <PrivateRoute allowedPermissions={["Registrar Equipos"]}>
            <EquipoForm />
          </PrivateRoute>
        }
      />

      <Route path="/equipos" element={<PrivateRoute><EquipoList /></PrivateRoute>} />

      {/* Ejemplo: Dashboard solo para admin */}
      <Route
        path="/roles"
        element={
          <PrivateRoute allowedPermissions={["Registrar Roles"]}>
            <RoleDashboard />
          </PrivateRoute>
        }
      />

      {/* Trabajos */}
      <Route path="/trabajos" element={<PrivateRoute><TrabajoManagement /></PrivateRoute>} />
      <Route path="/trabajos/register" element={<PrivateRoute allowedPermissions={["Registrar Trabajos"]}><TrabajoForm /></PrivateRoute>} />
      <Route path="/trabajos/:trabajoId/add-users" element={<PrivateRoute allowedPermissions={["Asignar Usuarios a Trabajo"]}><TrabajoAddUsers /></PrivateRoute>} />
      <Route path="/trabajos/:trabajoId/users" element={<PrivateRoute allowedPermissions={["Ver Usuarios de un Trabajo"]}><TrabajoUserList /></PrivateRoute>} />
      <Route path="/trabajos/taskboard" element={<PrivateRoute allowedPermissions={["Ver Tablero de Tareas"]}><Taskboard /></PrivateRoute>} />
      <Route path="/trabajos/cronograma" element={<PrivateRoute allowedPermissions={["Ver Cronograma de Trabajo"]}><CronogramaMantenimiento /></PrivateRoute>} />
      <Route path="/trabajos/calendario" element={<PrivateRoute allowedPermissions={["Ver Calendario de Mantenimientos"]}><CalendarioMantenimientos /></PrivateRoute>} />
      <Route path="/trabajos/pendientes" element={<PrivateRoute><TrabajoPendientes /></PrivateRoute>} />
      <Route path="/finalizar" element={<PrivateRoute><FinalizarTrabajoForm /></PrivateRoute>} />
      <Route path="/historial" element={<PrivateRoute><HistorialList /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
