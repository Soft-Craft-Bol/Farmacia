import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTrabajosByUser, getTrababjosPendienteRechazado } from "../../service/api";
import { getUser } from "../login/authFuntions";
import './CalendarioMantenimientos.css';

// Configuración de localización
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarioMantenimientos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const currentUser = getUser();

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        if (!currentUser) return;

        if (currentUser.roles[0] === 'Administrador') {
          const response = await getTrababjosPendienteRechazado();
          const trabajosAdmin = response.data?.data || [];

          setTrabajos(trabajosAdmin.map(trabajo => {
            const fechaInicio = trabajo.fechaInicio ? new Date(trabajo.fechaInicio) : new Date();
            const fechaFin = trabajo.fechaFin ? new Date(trabajo.fechaFin) : fechaInicio; // si no tiene fin, usar inicio
            return {
              ...trabajo,
              fechaInicio,
              fechaFin
            };
          }));

        } else if (currentUser.idUser) {
          const response = await getTrabajosByUser(currentUser.idUser);
          const asignaciones = response?.data?.asignaciones || [];

          const trabajosAsignados = asignaciones.map(asignacion => ({
            ...(asignacion.trabajo || {}),
            fechaInicio: asignacion.fechaInicio,
            fechaFin: asignacion.fechaFin,
            asignacionId: asignacion.id
          })).filter(trabajo => trabajo.id);

          setTrabajos(trabajosAsignados);
        }
      } catch (error) {
        console.error("Error al obtener los trabajos", error);
      }
    };
    fetchTrabajos();
  }, []);

  // Convertir trabajos a eventos para el calendario
  const eventos = trabajos.map(trabajo => ({
    id: trabajo.id,
    title: `${trabajo.nombre || 'Sin nombre'} - ${trabajo.area || 'Sin área'}`,
    start: new Date(trabajo.fechaInicio),
    end: new Date(trabajo.fechaFin),
    estado: trabajo.estado,
    descripcion: trabajo.descripcion,
    prioridad: trabajo.prioridad,
    asignacionId: trabajo.asignacionId,
    observaciones: trabajo.observaciones
  }));

  // Estilos personalizados según el estado
  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    let borderColor = '';

    switch (event.estado) {
      case 'Pendiente':
        backgroundColor = '#FFC107'; // Amarillo
        borderColor = '#E0A800';
        break;
      case 'En Progreso':
        backgroundColor = '#2196F3'; // Azul
        borderColor = '#0B7DDA';
        break;
      case 'Finalizado':
        backgroundColor = '#4CAF50'; // Verde
        borderColor = '#3D8B40';
        break;
      default:
        backgroundColor = '#9E9E9E'; // Gris
        borderColor = '#757575';
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

      <div className="user-info">
        <p>
          {currentUser.roles[0] === 'Administrador'
            ? 'Vista de administrador: Todos los trabajos'
            : `Tus trabajos asignados: ${currentUser.full_name || `Usuario #${currentUser.idUser}`}`}
        </p>
        <img
          src={currentUser.photo || '/default-avatar.png'}
          alt="Avatar"
          className="user-avatar"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <p>Total trabajos: {trabajos.length}</p>
      </div>

      <div className="calendar-legend">
        {currentUser.roles[0] === 'Administrador' ? (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FFC107' }}></span>
              <span>Pendiente</span>
            </div>
             <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
              <span>En Progreso</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
              <span>Finalizado</span>
            </div>
          </>
        ) : (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
              <span>En Progreso</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
              <span>Finalizado</span>
            </div>
          </>
        )}
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
              <p><strong>Prioridad:</strong> {selectedEvent.prioridad || 'No especificada'}</p>
              <p><strong>Inicio:</strong> {moment(selectedEvent.start).format('LLL')}</p>
              <p><strong>Fin:</strong> {moment(selectedEvent.end).format('LLL')}</p>
              <p><strong>Descripción:</strong> {selectedEvent.descripcion || 'Sin descripción'}</p>
              {selectedEvent.observaciones && (
                <p><strong>Observaciones:</strong> {selectedEvent.observaciones}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioMantenimientos;