import React from "react";
import { Draggable } from "react-beautiful-dnd";
import StrictModeDroppable from "./StrictModeDroppable";
import Card from "./card";

const Column = ({ column, tasks }) => {
  return (
    <div className="column-container">
      <h2 className="column-title">{column.title}</h2>

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
