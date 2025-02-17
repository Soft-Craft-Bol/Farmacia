import React from "react";
import { Draggable } from "react-beautiful-dnd";
import StrictModeDroppable from "./StrictModeDroppable";
import { GrEdit } from "react-icons/gr";
import { GoPlus } from "react-icons/go";
import Card from "./card";
import "./Taskboardtask.css";

const Column = ({ column, tasks }) => {
  return (
    <div className="column-container">
      <div className="column-header">
        <h2 className="column-title">{column.title}
          <div className="column-buttons">
            <button className="icon-button" onClick={() => onEditColumn(column.id)}>
              <GrEdit />
            </button>
            <button className="icon-button" onClick={() => onAddTask(column.id)}>
              <GoPlus />
            </button>
          </div>
        </h2>
      </div>
      <StrictModeDroppable droppableId={column.id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="column-tasks">
            {column.taskIds && column.taskIds.length > 0 ? (
              column.taskIds.map((taskId, index) => {
                const task = tasks[taskId];

                if (!task) return null;

                return (
                  <Draggable key={taskId} draggableId={String(task.id)} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <Card task={task} />
                      </div>
                    )}
                  </Draggable>
                );
              })
            ) : (
              <p>No tasks</p>
            )}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default Column;
