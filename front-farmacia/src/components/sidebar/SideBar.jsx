import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import './Sidebar.css';
import { IoIosArrowBack, PiChalkboardTeacher, GrAnalytics, FaUser, MdNavigateNext, FaHome,
   FaUserGraduate, TbLogout, AiOutlineGroup, FaCalendarAlt } from '../../hooks/icons';
import { useTheme } from '../../hooks/useTheme';
import { signOut } from '../../pages/login/authFuntions';


const staticUser = {
  photo: 'https://example.com/photo.jpg',  // URL de la foto del perfil
  username: 'Juan Pérez',
  roles: ['Usuario'],
};

const SidebarHeader = ({ onToggle, isOpen }) => {
  const currentUser = staticUser;
  const isAdmin = useMemo(() => currentUser?.roles.includes("Administrador"), [currentUser]);

  return (
    <header className="sidebar-header">
      <div className="text logo">
        <img className='logo-perfil' src={currentUser?.photo || ''} alt="Perfil" />
        <span className="name">{currentUser?.roles.includes('Administrador') ? 'Administrador' : 'Usuario'}</span>
        <span className="profe">{currentUser?.username || 'Usuario'}</span>
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
  const isAdmin = useMemo(() => currentUser?.roles.includes("Administrador"), [currentUser]);

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'close'}`}>
      <div className="menu-bar">
        <SidebarHeader onToggle={toggleSidebar} isOpen={isOpen} />
        <div className="menu">
          <ul className="menu-links">
            <SidebarLink to="/home" icon={<FaHome />} text="Dashboard" />
            <SidebarLink to="/userManagement" icon={<FaUser />} text="Usuarios" />
            {isAdmin && (
              <SidebarLink to="/listTeacher" icon={<PiChalkboardTeacher />} text="Profesores" />
            )}
            <SidebarLink to="/list-indicador" icon={<AiOutlineGroup />} text="Indicadores" />
            <SidebarLink to="/calendar" icon={<FaCalendarAlt />} text="Calendario" />
            <SidebarLink to="/graphics" icon={<GrAnalytics />} text="Graficos" />
            <SidebarLink to="/me-gustas" icon={<FaUserGraduate />} text="Likes" />
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
