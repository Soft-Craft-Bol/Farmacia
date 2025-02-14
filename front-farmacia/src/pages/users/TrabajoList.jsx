import React, { useEffect, useState } from 'react';
import { getTrabajos } from '../../service/api';
import './TrabajoList.css';

const TrabajoList = () => {
  const [trabajos, setTrabajos] = useState([]);

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
      } catch (error) {
        console.error('Error al obtener los trabajos:', error);
      }
    };

    fetchTrabajos();
  }, []);

  return (
    <div className="trabajo-list-container">
      <h2>Lista de Trabajos</h2>
      <ul>
        {trabajos.map((trabajo) => (
          <li key={trabajo.id}>
            <h3>{trabajo.nombre}</h3>
            <p>{trabajo.descripcion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrabajoList;