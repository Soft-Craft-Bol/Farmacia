import React from "react";
import './itemUser.css';

const ItemUser = (theUser) => {
    return (
        <div className="itemUsuario-contenedor">
            <div className="item-datos">
                <h1>{theUser.nombre}</h1>
                <p><strong>CI:</strong> {theUser.ci}</p>
                <p><strong>Correo:</strong> {theUser.correo}</p>
                <p><strong>Cargo:</strong> {theUser.cargo}</p>
                <p><strong>Cant. equipos:</strong> {theUser.cantTeams}</p>
            </div>
            <img src={theUser.foto} alt="Foto no cargada">
            </img>
            
        </div>
    )
}

export default ItemUser;