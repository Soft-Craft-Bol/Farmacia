import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import { initialColumns, tasks } from "./cards";
import "./Taskboardtask.css";

const TaskBoardtask = () => {
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // Evita soltar fuera de una columna

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceTaskIds = [...sourceCol.taskIds];
    const destTaskIds = source.droppableId === destination.droppableId ? sourceTaskIds : [...destCol.taskIds];

    // 🔹 Extraer el taskId y moverlo
    const [movedTaskId] = sourceTaskIds.splice(source.index, 1);
    destTaskIds.splice(destination.index, 0, movedTaskId);

    // 🔹 Actualizar el estado con las nuevas columnas
    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, taskIds: sourceTaskIds },
      [destination.droppableId]: { ...destCol, taskIds: destTaskIds },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="taskboard">
        {Object.entries(columns).map(([columnId, column]) => (
          <Column key={columnId} column={column} tasks={tasks} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoardtask;
