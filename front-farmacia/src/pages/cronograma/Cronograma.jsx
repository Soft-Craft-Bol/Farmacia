import React, { useState, useEffect } from "react";
import { getTrabajos, getUserNameById } from "../../service/api";
import "./Cronograma.css";

const Cronograma = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [meses, setMeses] = useState([]);
  const [año, setAño] = useState(new Date().getFullYear());
  const [nombresEncargados, setNombresEncargados] = useState({});

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
        generarMeses(response.data);
      } catch (error) {
        console.error("Error al obtener los trabajos", error);
      }
    };
    fetchTrabajos();
  }, [año]);

  const cargarNombresEncargados = async (trabajosData) => {
    const nombres = {};
    
    for (const trabajo of trabajosData) {
      if (!trabajo.encargadoId) continue;
      
      try {
        const response = await getUserNameById(trabajo.encargadoId);
        nombres[trabajo.encargadoId] = response.nombreCompleto;
      } catch (error) {
        console.error(`Error al obtener nombre del encargado ${trabajo.encargadoId}:`, error);
        nombres[trabajo.encargadoId] = `ID: ${trabajo.encargadoId}`;
      }
    }
    
    setNombresEncargados(nombres);
  };

  const generarMeses = (trabajosData) => {
    // Encontrar el rango de meses necesario basado en las fechas de los trabajos
    const mesesNombres = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    
    if (trabajosData.length === 0) {
      setMeses(mesesNombres);
      return;
    }

    // Encontrar el mes mínimo y máximo
    let minMonth = 11; // Diciembre
    let maxMonth = 0;  // Enero
    
    trabajosData.forEach(trabajo => {
      const inicio = new Date(trabajo.fechaInicio).getMonth();
      const fin = new Date(trabajo.fechaFin).getMonth();
      
      if (inicio < minMonth) minMonth = inicio;
      if (fin > maxMonth) maxMonth = fin;
    });

    // Asegurarnos de mostrar al menos 6 meses
    if (maxMonth - minMonth < 5) {
      maxMonth = Math.min(11, minMonth + 5);
    }

    setMeses(mesesNombres.slice(minMonth, maxMonth + 1));
  };

  const getColorByEstado = (estado) => {
    switch(estado) {
      case 'Pendiente': return '#FFC107'; // Amarillo
      case 'En progreso': return '#2196F3'; // Azul
      case 'Completado': return '#4CAF50'; // Verde
      case 'Cancelado': return '#F44336'; // Rojo
      default: return '#9E9E9E'; // Gris
    }
  };

  const estaActivoEnMes = (trabajo, mesIndex) => {
    const mesNumero = meses.findIndex(m => m === meses[mesIndex]) + 
                     new Date().getMonth() - (new Date().getMonth() - meses.findIndex(m => m === "ENE"));
    
    const inicio = new Date(trabajo.fechaInicio);
    const fin = new Date(trabajo.fechaFin);
    
    const inicioMes = new Date(año, mesNumero, 1);
    const finMes = new Date(año, mesNumero + 1, 0);
    
    return (inicio <= finMes && fin >= inicioMes);
  };

  const cambiarAño = (delta) => {
    setAño(año + delta);
  };

  return (
    <div className="cronograma-container">
      <div className="cronograma-header">
        <h2>Cronograma de Mantenimientos {año}</h2>
        <div className="controles-año">
          <button onClick={() => cambiarAño(-1)}>{"<"}</button>
          <span>{año}</span>
          <button onClick={() => cambiarAño(1)}>{">"}</button>
        </div>
      </div>

      <table className="cronograma-tabla">
        <thead>
          <tr>
            <th style={{ width: "25%" }}>Trabajo</th>
            <th style={{ width: "15%" }}>Área</th>
            <th style={{ width: "15%" }}>Encargado</th>
            {meses.map((mes) => (
              <th key={mes}>{mes}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trabajos.map((trabajo) => (
            <tr key={trabajo.id}>
              <td>
                <div className="trabajo-titulo">{trabajo.nombre}</div>
                <div className="trabajo-descripcion">{trabajo.descripcion}</div>
              </td>
              <td>{trabajo.area || "Sin área"}</td>
              <td>{nombresEncargados[trabajo.encargadoId] || `ID: ${trabajo.encargadoId}`}</td>
              {meses.map((mes, index) => (
                <td
                  key={`${trabajo.id}-${mes}`}
                  style={{
                    backgroundColor: estaActivoEnMes(trabajo, index)
                      ? getColorByEstado(trabajo.estado)
                      : "transparent",
                    position: "relative"
                  }}
                >
                  {estaActivoEnMes(trabajo, index) && (
                    <div className="tooltip">
                      {trabajo.nombre} ({trabajo.estado})<br />
                      {new Date(trabajo.fechaInicio).toLocaleDateString()} - {new Date(trabajo.fechaFin).toLocaleDateString()}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="leyenda">
        <div className="leyenda-item">
          <span className="leyenda-color" style={{backgroundColor: '#FFC107'}}></span>
          <span>Pendiente</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color" style={{backgroundColor: '#2196F3'}}></span>
          <span>En progreso</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color" style={{backgroundColor: '#4CAF50'}}></span>
          <span>Completado</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color" style={{backgroundColor: '#F44336'}}></span>
          <span>Cancelado</span>
        </div>
      </div>
    </div>
  );
};

export default Cronograma;