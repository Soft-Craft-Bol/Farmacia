import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarioMantenimientos.css";
import { getTrabajos } from "../../service/api";

const CalendarioMantenimientos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
      } catch (error) {
        console.error("Error al obtener los trabajos:", error);
      }
    };
    fetchTrabajos();
  }, []);

  const getEventsForDate = (date) => {
    return trabajos.filter(
      (trabajo) =>
        new Date(trabajo.fechaInicio).toDateString() === date.toDateString()
    );
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getColorForTrabajo = (trabajo) => {
    const colors = {
      "Pendiente": "highlight-pending",
      "En Progreso": "highlight-inprogress",
      "Completado": "highlight-completed"
    };
    return colors[trabajo.estado] || "highlight-default";
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const eventsThisDay = getEventsForDate(date);
      if (eventsThisDay.length > 0) {
        return eventsThisDay.map(trabajo => getColorForTrabajo(trabajo)).join(" ");
      }
    }
    return null;
  };

  const eventsOfSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Calendario de Mantenimientos</h2>
      <Calendar onClickDay={handleDayClick} tileClassName={tileClassName} />
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>✕</button>
            <h2>
              Trabajos para el {selectedDate?.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </h2>
            <hr />
            {eventsOfSelectedDate.length === 0 ? (
              <p>No hay trabajos programados.</p>
            ) : (
              <ul>
                {eventsOfSelectedDate.map((trabajo) => (
                  <li key={trabajo.id} className={getColorForTrabajo(trabajo)}>
                    <strong>{trabajo.area || "General"}</strong>: {trabajo.nombre} <br />
                    <em>Estado: {trabajo.estado}</em>
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