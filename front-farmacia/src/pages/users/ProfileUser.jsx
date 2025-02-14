import { useState, useEffect } from "react";
import "./ProfileUser.css";
import { FaUser } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { FaIdCard } from "react-icons/fa6";
import { MdWorkspaces } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { RiUser2Fill } from "react-icons/ri";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    fetch("http://localhost:5000/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          let errMessage = "Error desconocido";
          try {
            const errorData = await response.json();
            errMessage = errorData.error || errMessage;
          } catch (err) {
            console.error("Error procesando respuesta JSON:", err);
          }
          throw new Error(errMessage);
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container">
      <div className="content">
        
        <div className="profile-row">
          <div className="perfil-container">
            <div className="profile-image">
              <img
                src={user?.foto ? user.foto : `https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif`}
                alt="Perfil"
                className="img-perfil"
              />
            </div>
          </div>

          <div className="info-container">
            <h1 className="profile-name">
              {user.nombre} {user.apellido}
            </h1>
            <p className="profile-title">
              {user.profesion}{" "}
            </p>
            <div className="meta-item">
              <FaUser className="meta-icon" />
              <span className="meta-text">Usuario: {user.usuario}</span>
            </div>
            <div className="meta-item">
              <IoIosMail className="meta-icon" />
              <span className="meta-text">{user.email}</span>
            </div>
            
          </div>
          
        </div>
              <div className="info-group">
                <MdWorkspaces className="meta-icon" />
                <span className="meta-text">
                  Área: {user.nombre}
                </span>
              </div>
            <div className="info-group">
              <FaIdCard className="meta-icon" />
              <span className="meta-text">CI: {user.ci}</span>
            </div>
            <div className="info-group">
              <FaUserGroup className="meta-icon" />
              <span className="meta-text">Roles: {user.roles ? user.roles.join(", ") : "Sin roles"}</span>
            </div>
            <div className="info-group">
              <RiUser2Fill className="meta-icon" />
              <span className="meta-text">Profesion:  {user.profesion}</span>
            </div>
      </div>
    </div>
  );
}
