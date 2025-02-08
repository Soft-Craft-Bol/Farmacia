import React from "react";
import './itemUser.css';

const ItemUser = ({ theUser }) => { 
    return (
        <div className="itemUsuario-contenedor">
            <div className="item-datos">
                <h1>{theUser.nombre} {theUser.apellido}</h1>
                <p><strong>CI:</strong> {theUser.ci}</p>
                <p><strong>Correo:</strong> {theUser.email}</p>
                <p><strong>Cargo:</strong> {theUser.profesion}</p>
                <p><strong>Cant. equipos:</strong> NoImplementado</p>
            </div>
            <img 
                src={theUser.foto || "https://via.placeholder.com/150"} 
                alt="Foto de usuario" 
            />
        </div>
    );
};

export default ItemUser;
