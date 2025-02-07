import React, { useState } from "react";
import { isTokenValid } from "../utils/Auth";
import { getToken } from "../pages/login/authFuntions";
import { Navigate } from 'react-router-dom';
import Sidebar from "../components/sidebar/SideBar";

const PrivateRoute = ({ children }) => {
  const token = getToken();
  const tokenExistAndStillValid = token && isTokenValid(token);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return tokenExistAndStillValid ? (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        {children}
      </main>

    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
