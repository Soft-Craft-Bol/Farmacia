import React from "react";

const Card = ({ task }) => {
  if (!task) return null;

  return (
    <div
      className="card"
      style={{ borderLeft: `5px solid ${task.priority.color || "orange"}` }}
    >
      <h3 className="card-title">{task.title}</h3>
      <p className="card-description">{task.description}</p>
      {task.image && (
        <img
          src={task.image}
          alt={task.title}
          className="card-image"
          style={{ width: "80px", marginTop: "10px" }}
        />
      )}
    </div>
  );
};

export default Card;
