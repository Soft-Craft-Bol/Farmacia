import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { getMantenimientos } from "../../service/api";

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMantenimientos();
        const data = response.data;

        const mappedEvents = data.map((mnt) => ({
          id: mnt.id,
          title: `Equipo: ${mnt.equipo} - Tipo: ${mnt.tipo}`,
          start: mnt.fecha,    // Debe ser string o Date
          // Opcional: end: ...
          backgroundColor: mnt.importante ? "red" : "blue",
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error al cargar mantenimientos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Calendario de Mantenimientos</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        // Otras configuraciones...
      />
    </div>
  );
};

export default Calendar;
