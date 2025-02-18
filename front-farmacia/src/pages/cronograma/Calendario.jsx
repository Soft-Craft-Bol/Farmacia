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
        console.error("Error al obtener los trabajos", error);
      }
    };
    fetchTrabajos();
  }, []);

  const getEventsForDate = (date) => {
    return trabajos.filter(
      (trabajo) => new Date(trabajo.fechaFin).toDateString() === date.toDateString()
    );
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const eventsThisDay = getEventsForDate(date);
      if (eventsThisDay.length > 0) {
        return "highlight-maintenance";
      }
    }
    return null;
  };

  const eventsOfSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <Calendar onClickDay={handleDayClick} tileClassName={tileClassName} />

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>✕</button>
            <h2>
              Trabajos para el {selectedDate?.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <hr style={{ margin: "0.5rem 0 1rem 0" }} />
            {eventsOfSelectedDate.length === 0 ? (
              <p>No hay trabajos programados.</p>
            ) : (
              <ul style={{ textAlign: "left" }}>
                {eventsOfSelectedDate.map((trabajo) => (
                  <li key={trabajo.id} style={{ marginBottom: "0.5rem" }}>
                    <strong>{trabajo.nombre}</strong>: {trabajo.descripcion} <br />
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
