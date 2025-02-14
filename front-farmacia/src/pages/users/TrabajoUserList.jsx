import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTrabajoById } from '../../service/api';
import './TrabajoUserList.css';

const TrabajoUserList = () => {
  const { trabajoId } = useParams();
  const [trabajo, setTrabajo] = useState(null);

  useEffect(() => {
    const fetchTrabajo = async () => {
      try {
        const response = await getTrabajoById(trabajoId);
        setTrabajo(response.data);
      } catch (error) {
        console.error('Error al obtener el trabajo:', error);
      }
    };

    fetchTrabajo();
  }, [trabajoId]);

  if (!trabajo) return <div>Cargando...</div>;

  return (
    <div className="trabajo-user-list-container">
      <h2>Usuarios del Trabajo: {trabajo.nombre}</h2>
      <ul>
        {trabajo.equipos.map((equipo) => (
          <li key={equipo.user.id}>
            <strong>{equipo.user.nombre}</strong> ({equipo.user.email})
            <p>
              Rol: {equipo.isAdmin ? 'Admin' : 'Usuario'} |{' '}
              {equipo.isJefe ? 'Jefe de Trabajo' : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrabajoUserList;