import React, { useState, useEffect } from 'react';
import { getAreas, getProximoMantenimiento } from '../../service/api';
import './Cronograma.css';

const Cronograma = () => {
  const [areas, setAreas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [areasResponse, equiposResponse] = await Promise.all([
          getAreas(),
          getProximoMantenimiento()
        ]);

        console.log('Áreas obtenidas:', areasResponse.data);
        console.log('Equipos obtenidos:', equiposResponse.data);

        setAreas(areasResponse.data);
        setEquipos(equiposResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para obtener las semanas del mes
  const getSemanasDelMes = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const semanas = [];
    let inicioSemana = new Date(firstDay);
    
    // Ajustar para que la semana comience en lunes
    if (inicioSemana.getDay() === 0) { // Domingo
      inicioSemana.setDate(inicioSemana.getDate() - 6);
    } else {
      inicioSemana.setDate(inicioSemana.getDate() - (inicioSemana.getDay() - 1));
    }
    
    while (inicioSemana <= lastDay) {
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);
      
      semanas.push({
        inicio: new Date(inicioSemana),
        fin: finSemana > lastDay ? new Date(lastDay) : finSemana
      });
      
      inicioSemana.setDate(inicioSemana.getDate() + 7);
    }
    
    return semanas.slice(0, 4); // Solo mostramos 4 semanas
  };

  const semanas = getSemanasDelMes(fechaActual);

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  // Función para verificar si una fecha está en un rango
  const isDateInRange = (date, start, end) => {
    if (!date) return false;
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
  };

  // Función para cambiar de mes
  const cambiarMes = (incremento) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaActual(nuevaFecha);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="cronograma-container">
      <div className="cronograma-header">
        <h2>Cronograma de Mantenimientos Predictivos</h2>
        <div className="month-navigator">
          <button onClick={() => cambiarMes(-1)}>&lt; Anterior</button>
          <span>
            {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => cambiarMes(1)}>Siguiente &gt;</button>
        </div>
      </div>
      
      <div className="cronograma-grid">
        {/* Cabecera de semanas */}
        <div className="grid-header area-header">Áreas</div>
        {semanas.map((semana, index) => (
          <div key={`semana-${index}`} className="grid-header semana-header">
            Semana {index + 1}<br />
            {formatDate(semana.inicio)} - {formatDate(semana.fin)}
          </div>
        ))}
        
        {/* Filas de áreas */}
        {areas.map((area) => {
          const equiposArea = equipos.filter(e => e.ubicacion === area.nombre);
          
          return (
            <React.Fragment key={`area-${area.id}`}>
              <div className="area-nombre">{area.nombre}</div>
              
              {semanas.map((semana, semanaIndex) => {
                const eventos = equiposArea.filter(e => 
                  isDateInRange(e.proximoMantenimientoRegresion, semana.inicio, semana.fin)
                );
                
                return (
                  <div key={`celda-${area.id}-${semanaIndex}`} className="celda-semana">
                    {eventos.map((equipo, eventoIndex) => (
                      <div 
                        key={`evento-${equipo.id}-${eventoIndex}`} 
                        className={`evento-mantenimiento ${equipo.tipoMantenimiento.toLowerCase()}`}
                      >
                        <div className="evento-equipo">
                          <strong>{equipo.etiquetaActivo}</strong>
                        </div>
                        <div className="evento-detalle">
                          <small>Tipo: {equipo.tipoMantenimiento}</small>
                        </div>
                        <div className="evento-detalle">
                          <small>Predicción: {formatDate(equipo.proximoMantenimientoRegresion)}</small>
                        </div>
                        <div className="evento-detalle">
                          <small>Días predichos: {equipo.diasPredichos}</small>
                        </div>
                        {equipo.diasParaProximo <= equipo.limiteInferior && (
                          <div className="evento-alerta">¡Mantenimiento próximo!</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Cronograma;