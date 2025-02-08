import { useState, useEffect } from "react";
import "./ProfileUser.css";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(localStorage.getItem("token"));

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
        <h1>Perfil del Usuario</h1>
        <div className="perfil-container">
          <div className="profile-image">
            
            <img 
              src={user.foto || "https://via.placeholder.com/150"}
              alt="Perfil"
              className="img-perfil"
            />
          </div>
        </div>

        <div className="info-container">
          <div className="info-group">
            <span className="label">Usuario:</span>
            <span className="value">{user.usuario}</span>
          </div>
          <div className="info-group">
            <span className="label">Correo:</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="info-group">
            <span className="label">Nombre:</span>
            <span className="value">{user.nombre}</span>
          </div>
          <div className="info-group">
            <span className="label">Apellido:</span>
            <span className="value">{user.apellido}</span>
          </div>
          <div className="info-group">
            <span className="label">CI:</span>
            <span className="value">{user.ci}</span>
          </div>
          <div className="info-group">
            <span className="label">Profesión:</span>
            <span className="value">{user.profesion}</span>
          </div>
          <div className="info-group">
            <span className="label">Área:</span>
            <span className="value">{user.area}</span>
          </div>
          <div className="info-group">
            <span className="label">Roles:</span>
            <span className="value">{user.roles ? user.roles.join(", ") : "Sin roles"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
