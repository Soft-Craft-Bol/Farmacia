import { Link } from 'react-router-dom';
import { useMemo,useState,useEffect } from 'react';
import './Sidebar.css';
import { IoIosArrowBack, PiChalkboardTeacher, GrAnalytics, MdNavigateNext, FaHome,
    TbLogout, AiOutlineGroup, FaCalendarAlt,RiTeamFill, FaUsersGear,PiUsersFourDuotone } from '../../hooks/icons';
import { useTheme } from '../../hooks/useTheme';
import { signOut, getUser } from '../../pages/login/authFuntions';
import { FaUserCircle } from 'react-icons/fa';
import { getUserProfile } from '../../service/api';
import { BsKanban } from "react-icons/bs";


const SidebarHeader = ({ onToggle, isOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);

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
        {/* {console.log("✅ Datos obtenidos del usuario:", currentUser?.usuario)} */}
        <img
          className="logo-perfil"
          src={currentUser?.foto ? currentUser.foto : `https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif`}
          alt="Perfil"
        />
        <span className="name">
           <i>Bienvenido {isAdmin ? "Administrador" : "Usuario"} </i></span> 
        <span className="profe">{currentUser?.nombre || "Usuario"}</span>
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

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const currentUser = useMemo(() => getUser(), []);
  /* const isAdmin = useMemo(() => currentUser?.roles.includes("Administrador"), [currentUser]); */

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
            <SidebarLink to="/profile" icon={<FaUserCircle />} text="Perfil" />
            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" />
            <SidebarLink to="/userManagement" icon={<FaUsersGear />} text="Usuarios" />
            {/* {isAdmin && (
              
            )} */}
            <SidebarLink to="/equipos" icon={<PiChalkboardTeacher />} text="Equipos" />
            <SidebarLink to="/trabajos/calendario" icon={<FaCalendarAlt />} text="Calendario" />
            <SidebarLink to="/trabajos/taskboard" icon={<BsKanban  />} text="Tablero de seguimiento" />
            <SidebarLink to="/teams/register" icon={<RiTeamFill />} text="Registrar Equipo" />
            <SidebarLink to="/trabajos/register" icon={<RiTeamFill />} text="Crear Trabajo" />
            <SidebarLink to="/trabajos" icon={<GrAnalytics />} text="Listar Trabajos" />

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
