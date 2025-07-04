import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import './Sidebar.css';
import {
  IoIosArrowBack, PiChalkboardTeacher, GrAnalytics, MdNavigateNext, FaHome,
  TbLogout, AiOutlineGroup, FaCalendarAlt, RiTeamFill, FaUsersGear, PiUsersFourDuotone
} from '../../hooks/icons';
import { useTheme } from '../../hooks/useTheme';
import { signOut, getUser, getPermissions } from '../../pages/login/authFuntions';
import { FaUserCircle } from 'react-icons/fa';
import { getUserProfile } from '../../service/api';
import { BsKanban } from "react-icons/bs";
import { GrSchedule } from 'react-icons/gr';
import { MdAlignHorizontalCenter, MdAllInbox, MdHistory } from 'react-icons/md';

const SidebarHeader = ({ onToggle, isOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const current = getUser();
  const userPermissions = getPermissions();

  const hasPermission = (permiso) => userPermissions.includes(permiso);



  useEffect(() => {
    getUserProfile()
      .then((userData) => {
        if (userData) {
          setCurrentUser(userData);
        }
      })
      .catch((error) => console.error("Error al obtener el perfil:", error));
  }, []);

  const isAdmin = useMemo(() => currentUser?.roles?.includes("Administrador"), [currentUser]);

  return (
    <header className="sidebar-header">
      <div className="text logo">
        <img
          className="logo-perfil"
          src={current.photo ? current.photo : `https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif`}
          alt="Perfil"
        />
        <span className="name">
          <i>Bienvenido {current.full_name}</i>
        </span>
        <span className="profe">{current.roles[0] || "Usuario"}</span>
      </div>
      {isOpen ? (
        <IoIosArrowBack className="toggle" onClick={onToggle} />
      ) : (
        <MdNavigateNext className="toggle reverse" onClick={onToggle} />
      )}
    </header>
  );
};

const SidebarLink = ({ to, icon, text }) => (
  <li className="nav-link">
    <Link to={to}>
      <i className="icon">{icon}</i>
      <span className="text nav-text">{text}</span>
    </Link>
  </li>
);

const SidebarLogout = () => (
  <li>
    <Link to="/logout" onClick={signOut}>
      <i className="icon"><TbLogout /></i>
      <span className="text nav-text">Cerrar sesión</span>
    </Link>
  </li>
);

const SidebarThemeToggle = ({ theme, toggleTheme }) => (
  <li className="mode">
    <div className="sun-moon">
      <i className={`icon moon ${theme === 'dark' ? 'active' : ''}`} />
      <i className={`icon sun ${theme === 'light' ? 'active' : ''}`} />
    </div>
    <span className="mode-text text">Modo Oscuro</span>
    <div className="toggle-switch" onClick={toggleTheme}>
      <span className={`switch ${theme === 'dark' ? 'active' : ''}`} />
    </div>
  </li>
);

const sidebarLinks = [
  { to: '/profile', icon: <FaUserCircle />, text: 'Perfil', permiso: 'Ver Perfil Usuario' },
  { to: '/home', icon: <FaHome />, text: 'Inicio', permiso: 'Acceder al Dashboard' },
  { to: '/trabajos/taskboard', icon: <BsKanban />, text: 'Tablero de seguimiento', permiso: 'Ver Tablero de Tareas' },
  { to: '/trabajos/calendario', icon: <FaCalendarAlt />, text: 'Calendario', permiso: 'Ver Calendario de Mantenimientos' },
  { to: '/historial', icon: <MdHistory />, text: 'Repositorio de trabajo', permiso: 'Ver Cronograma de Trabajo' },

  { to: '/userManagement', icon: <FaUsersGear />, text: 'Usuarios', permiso: 'Ver Usuarios' },
  { to: '/equipos', icon: <PiChalkboardTeacher />, text: 'Equipos', permiso: 'Ver Equipos' },
  { to: '/trabajos/register', icon: <MdAllInbox />, text: 'Registrar Trabajo', permiso: 'Registrar Trabajos' },
  { to: '/trabajos/cronograma', icon: <GrSchedule />, text: 'Cronograma', permiso: 'Ver Cronograma de Trabajo' },
  { to: '/trabajos', icon: <GrAnalytics />, text: 'Trabajos', permiso: 'Ver Trabajos' },
];


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const currentUser = useMemo(() => getUser(), []);
  const userPermissions = useMemo(() => getPermissions(), []);  

  const hasPermission = (permiso) => userPermissions.includes(permiso);

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
            {sidebarLinks
              .filter(link => hasPermission(link.permiso))
              .map(link => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  text={link.text}
                />
              ))}
          </ul>
        </div>
        <div className="bottom-content">
          <SidebarLogout />
          <SidebarThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
