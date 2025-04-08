import React from "react";
import { FaUser, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import "./Taskboardtask.css";

const Card = ({ task }) => {
  if (!task) return null;

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className="task-priority" style={{ backgroundColor: task.priority.color }}></span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        {task.area && (
          <span className="task-area">
            <FaMapMarkerAlt /> {task.area}
          </span>
        )}
      </div>
      
      <div className="task-dates">
        <span>
          <FaCalendarAlt /> Inicio: {task.fechaInicio}
        </span>
        {task.fechaFin && (
          <span>
            <FaCalendarAlt /> Fin: {task.fechaFin}
          </span>
        )}
      </div>
    </div>
  );
};

export default Card;