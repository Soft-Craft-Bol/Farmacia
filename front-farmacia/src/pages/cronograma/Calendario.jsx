import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarioMantenimientos.css";  // Aquí tenemos nuestras clases extra (opcional)

const CalendarioMantenimientos = () => {
  // Datos para cada “tipo” de calendario:
  const calendarsData = {
    informatica: [
      {
        date: "2025-02-18",
        area: "Informatica",
        desc: "Mantenimiento de servidores",
        resp: "Carlos"
      },
      {
        date: "2025-02-20",
        area: "Informatica",
        desc: "Actualización de software",
        resp: "Laura"
      }
    ],
    biomedica: [
      {
        date: "2025-02-18",
        area: "Biomedica",
        desc: "Revisión de equipos de rayos X",
        resp: "Diana"
      },
      {
        date: "2025-02-22",
        area: "Biomedica",
        desc: "Mantenimiento de incubadoras",
        resp: "Mario"
      }
    ],
    general: [
      {
        date: "2025-02-18",
        area: "General",
        desc: "Inspección general de instalaciones",
        resp: "Pedro"
      }
    ]
  };

  const [selectedCalendar, setSelectedCalendar] = useState("informatica");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Retorna los  del calendario actual.
  // Si la vista es “general” y queremos mezclar datos, podemos combinar arrays.
  const getCurrentCalendarEvents = () => {
    if (selectedCalendar === "general") {
      // Mezclamos informatica + biomedica + general
      return [
        ...calendarsData.informatica,
        ...calendarsData.biomedica,
        ...calendarsData.general
      ];
    }
    return calendarsData[selectedCalendar] || [];
  };

  // Filtra los eventos para una fecha específica
  const getEventsForDate = (date) => {
    const events = getCurrentCalendarEvents();
    // Convertimos a toDateString() para comparar sin horas
    return events.filter(
      (event) => new Date(event.date).toDateString() === date.toDateString()
    );
  };

  // Se llama al dar clic en un día del calendario
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Asigna clases de estilo a cada “tile”
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const eventsThisDay = getEventsForDate(date);
      if (eventsThisDay.length > 0) {
        // Tomamos el área del primer evento
        // Para CSS, usamos minusculas
        const areaClass = eventsThisDay[0].area.toLowerCase();
        return `highlight-${areaClass}`;
      }
    }
    return null;
  };

  // Eventos de la fecha seleccionada (para mostrarlos en el modal)
  const eventsOfSelectedDate = selectedDate
    ? getEventsForDate(selectedDate)
    : [];

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {/* Selector de calendario */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>
          Seleccione Calendario:
        </label>
        <select
          value={selectedCalendar}
          onChange={(e) => setSelectedCalendar(e.target.value)}
          style={{
            padding: "0.4rem",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        >
          <option value="informatica">Informática</option>
          <option value="biomedica">Biomédica</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Calendario principal (más grande, con estilos) */}
      <Calendar
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
      />

      {/* Modal personalizado para mostrar datos de la fecha seleccionada */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content"
            // Evita que al dar clic dentro del modal se cierre
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-button" onClick={closeModal}>
              ✕
            </button>
            {/* Encabezado del modal */}
            <h2>
              Trabajos para el{" "}
              {selectedDate?.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </h2>
            <hr style={{ margin: "0.5rem 0 1rem 0" }} />
            {/* Contenido del modal */}
            {eventsOfSelectedDate.length === 0 ? (
              <p>No hay trabajos programados.</p>
            ) : (
              <ul style={{ textAlign: "left" }}>
                {eventsOfSelectedDate.map((event, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <strong>{event.area}</strong>: {event.desc} <br />
                    <em>Responsable: {event.resp}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioMantenimientos;
