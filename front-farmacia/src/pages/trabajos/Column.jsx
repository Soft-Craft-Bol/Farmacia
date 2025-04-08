import React from "react";
import { Draggable } from "react-beautiful-dnd";
import StrictModeDroppable from "./StrictModeDroppable";
import Card from "./Card";
import "./Taskboardtask.css";

const Column = ({ column, tasks }) => {
  return (
    <div className="column-container" style={{ borderTop: `4px solid ${column.color}` }}>
      <div className="column-header">
        <h2 className="column-title">
          {column.title}
          <span className="badge">{column.taskIds.length}</span>
        </h2>
      </div>
      
      <StrictModeDroppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-tasks ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            style={{ backgroundColor: snapshot.isDraggingOver ? `${column.color}20` : 'inherit' }}
          >
            {column.taskIds.length > 0 ? (
              column.taskIds.map((taskId, index) => {
                const task = tasks[taskId];
                if (!task) return null;

                return (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`task-container ${snapshot.isDragging ? 'dragging' : ''}`}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                      >
                        <Card task={task} />
                      </div>
                    )}
                  </Draggable>
                );
              })
            ) : (
              <div className="empty-column">
                No hay trabajos en este estado
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default Column;