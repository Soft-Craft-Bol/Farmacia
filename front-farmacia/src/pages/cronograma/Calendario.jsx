import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTrabajos } from "../../service/api";
import './CalendarioMantenimientos.css';

// Configuración de localización
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarioMantenimientos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
      } catch (error) {
        console.error("Error al obtener los trabajos", error);
      }
    };
    fetchTrabajos();
  }, []);

  // Convertir trabajos a eventos para el calendario
  const eventos = trabajos.map(trabajo => ({
    id: trabajo.id,
    title: `${trabajo.nombre} - ${trabajo.area}`,
    start: new Date(trabajo.fechaInicio),
    end: new Date(trabajo.fechaFin),
    estado: trabajo.estado,
    descripcion: trabajo.descripcion,
    encargadoId: trabajo.encargadoId
  }));

  // Estilos personalizados según el estado
  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    let borderColor = '';
    
    if (event.estado === 'Pendiente') {
      backgroundColor = '#ffd700'; // Amarillo para pendientes
      borderColor = '#e6c200';
    } else if (event.estado === 'En progreso') {
      backgroundColor = '#4682b4'; // Azul para en progreso
      borderColor = '#3a6d99';
    } else if (event.estado === 'Completado') {
      backgroundColor = '#32cd32'; // Verde para completados
      borderColor = '#2db82d';
    } else if (event.estado === 'Cancelado') {
      backgroundColor = '#ff4500'; // Rojo para cancelados
      borderColor = '#e03e00';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: `1px solid ${borderColor}`,
        color: '#fff',
        display: 'block',
        fontWeight: 'bold'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container">
      <h2>Calendario de Mantenimientos</h2>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#ffd700'}}></span>
          <span>Pendiente</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#4682b4'}}></span>
          <span>En progreso</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#32cd32'}}></span>
          <span>Completado</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#ff4500'}}></span>
          <span>Cancelado</span>
        </div>
      </div>

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
            noEventsInRange: 'No hay trabajos en este rango.'
          }}
        />
      </div>

      {selectedEvent && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>✕</button>
            <h2>{selectedEvent.title}</h2>
            <div className="event-details">
              <p><strong>Estado:</strong> {selectedEvent.estado}</p>
              <p><strong>Inicio:</strong> {moment(selectedEvent.start).format('LLL')}</p>
              <p><strong>Fin:</strong> {moment(selectedEvent.end).format('LLL')}</p>
              <p><strong>Descripción:</strong> {selectedEvent.descripcion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioMantenimientos;