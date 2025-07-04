import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEquipos } from "../../service/api";
import { getUser } from "../login/authFuntions";
import './CalendarioMantenimientos.css';

// Configuración de localización
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarioMantenimientos = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    tipoEquipo: 'Todos',
    estado: 'Todos',
    tipoMantenimiento: 'Todos'
  });
  const currentUser = getUser();

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await getEquipos();
        const equiposData = response.data || [];
        
        // Procesar fechas y asegurarse que son válidas
        const equiposProcesados = equiposData.map(equipo => ({
          ...equipo,
          fechaInicioUso: equipo.fechaInicioUso ? new Date(equipo.fechaInicioUso) : null,
          ultimoMantenimiento: equipo.ultimoMantenimiento ? new Date(equipo.ultimoMantenimiento) : null,
          proximoMantenimiento: equipo.proximoMantenimiento ? new Date(equipo.proximoMantenimiento) : null,
          fechaCompra: equipo.fechaCompra ? new Date(equipo.fechaCompra) : null
        }));
        
        setEquipos(equiposProcesados);
        setFilteredEquipos(equiposProcesados);
      } catch (error) {
        console.error("Error al obtener los equipos", error);
      }
    };
    fetchEquipos();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultados = [...equipos];
    
    if (filters.tipoEquipo !== 'Todos') {
      resultados = resultados.filter(equipo => 
        equipo.tipoEquipo === filters.tipoEquipo
      );
    }
    
    if (filters.estado !== 'Todos') {
      resultados = resultados.filter(equipo => 
        equipo.estado === filters.estado
      );
    }
    
    if (filters.tipoMantenimiento !== 'Todos') {
      resultados = resultados.filter(equipo => 
        equipo.tipoMantenimiento === filters.tipoMantenimiento
      );
    }
    
    setFilteredEquipos(resultados);
  }, [filters, equipos]);

  // Obtener tipos únicos para los filtros
  const tiposEquipo = [...new Set(equipos.map(e => e.tipoEquipo || 'Sin tipo'))];
  const estados = [...new Set(equipos.map(e => e.estado))];
  const tiposMantenimiento = [...new Set(equipos.map(e => e.tipoMantenimiento))];

  // Convertir equipos a eventos para el calendario
  const eventos = filteredEquipos.flatMap(equipo => {
    const eventosEquipo = [];
    
    // Evento para fecha de inicio de uso (si existe)
    if (equipo.fechaInicioUso) {
      eventosEquipo.push({
        id: `inicio-${equipo.id}`,
        title: `Inicio uso: ${equipo.etiquetaActivo}`,
        start: equipo.fechaInicioUso,
        end: equipo.fechaInicioUso,
        tipo: 'inicio_uso',
        equipo: equipo,
        color: '#4CAF50' // Verde
      });
    }
    
    // Evento para último mantenimiento (si existe)
    if (equipo.ultimoMantenimiento) {
      eventosEquipo.push({
        id: `ultimo-${equipo.id}`,
        title: `Último mant: ${equipo.etiquetaActivo}`,
        start: equipo.ultimoMantenimiento,
        end: equipo.ultimoMantenimiento,
        tipo: 'ultimo_mantenimiento',
        equipo: equipo,
        color: '#2196F3' // Azul
      });
    }
    
    // Evento para próximo mantenimiento (si existe)
    if (equipo.proximoMantenimiento) {
      eventosEquipo.push({
        id: `proximo-${equipo.id}`,
        title: `Próximo mant: ${equipo.etiquetaActivo}`,
        start: equipo.proximoMantenimiento,
        end: equipo.proximoMantenimiento,
        tipo: 'proximo_mantenimiento',
        equipo: equipo,
        color: '#FF9800' // Naranja
      });
    }
    
    return eventosEquipo;
  });

  // Estilos personalizados según el tipo de evento
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        border: 'none',
        color: '#fff',
        display: 'block',
        fontWeight: 'bold',
        padding: '2px 5px'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="calendar-container">
      <h2>Calendario de Mantenimiento de Equipos</h2>

      {/* Filtros */}
      <div className="filtros-equipos">
        <div className="filtro-group">
          <label>Tipo de Equipo:</label>
          <select 
            name="tipoEquipo" 
            value={filters.tipoEquipo}
            onChange={handleFilterChange}
          >
            <option value="Todos">Todos</option>
            {tiposEquipo.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Estado:</label>
          <select 
            name="estado" 
            value={filters.estado}
            onChange={handleFilterChange}
          >
            <option value="Todos">Todos</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Tipo Mantenimiento:</label>
          <select 
            name="tipoMantenimiento" 
            value={filters.tipoMantenimiento}
            onChange={handleFilterChange}
          >
            <option value="Todos">Todos</option>
            {tiposMantenimiento.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leyenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>Inicio de uso</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
          <span>Último mantenimiento</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
          <span>Próximo mantenimiento</span>
        </div>
      </div>

      {/* Calendario */}
      <div style={{ height: '700px', marginTop: '20px' }}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={{
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango.'
          }}
        />
      </div>

      {/* Modal de detalles */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>✕</button>
            
            <h2>{selectedEvent.equipo.etiquetaActivo}</h2>
            <h3>
              {selectedEvent.tipo === 'inicio_uso' && 'Inicio de uso'}
              {selectedEvent.tipo === 'ultimo_mantenimiento' && 'Último Mantenimiento'}
              {selectedEvent.tipo === 'proximo_mantenimiento' && 'Próximo Mantenimiento'}
            </h3>
            
            <div className="event-details">
              <p><strong>Modelo:</strong> {selectedEvent.equipo.modelo}</p>
              <p><strong>N° Serie:</strong> {selectedEvent.equipo.numeroSerie}</p>
              <p><strong>Ubicación:</strong> {selectedEvent.equipo.ubicacion}</p>
              <p><strong>Tipo:</strong> {selectedEvent.equipo.tipoEquipo || 'Sin especificar'}</p>
              <p><strong>Estado:</strong> {selectedEvent.equipo.estado}</p>
              
              <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('LLL')}</p>
              
              {selectedEvent.tipo === 'proximo_mantenimiento' && (
                <p>
                  <strong>Período Mantenimiento:</strong> 
                  {selectedEvent.equipo.periodoMantenimiento} días
                </p>
              )}
              
              {selectedEvent.tipo === 'ultimo_mantenimiento' && (
                <p>
                  <strong>Horas de uso:</strong> 
                  {selectedEvent.equipo.horasUsoAcumuladas}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioMantenimientos;