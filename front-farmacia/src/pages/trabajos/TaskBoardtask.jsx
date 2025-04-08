import React, { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { UpdateEstado, getTrabajos } from "../../service/api";
import Column from "./Column";
import "./Taskboardtask.css";

const TaskBoardtask = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [columns, setColumns] = useState({
    pendiente: {
      id: "pendiente",
      title: "Pendiente",
      taskIds: [],
      color: "#FFC107"
    },
    en_progreso: {
      id: "en_progreso",
      title: "En Progreso",
      taskIds: [],
      color: "#2196F3"
    },
    finalizado: {
      id: "finalizado",
      title: "Finalizado",
      taskIds: [],
      color: "#4CAF50"
    }
  });

  // Cargar trabajos al montar el componente
  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
        organizarTrabajosEnColumnas(response.data);
      } catch (error) {
        console.error("Error al obtener trabajos:", error);
      }
    };
    fetchTrabajos();
  }, []);

  // Organizar trabajos por estado
  const organizarTrabajosEnColumnas = (trabajos) => {
    const newColumns = { ...columns };
    
    Object.keys(newColumns).forEach(colId => {
      newColumns[colId].taskIds = [];
    });

    trabajos.forEach(trabajo => {
      const estadoNormalizado = trabajo.estado.toLowerCase().replace(/\s+/g, '_');
      if (newColumns[estadoNormalizado]) {
        newColumns[estadoNormalizado].taskIds.push(trabajo.id.toString());
      }
    });

    setColumns(newColumns);
  };

  // Manejar el cambio de estado al soltar
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    try {
      // Determinar el nuevo estado basado en la columna destino
      let nuevoEstado;
      switch(destination.droppableId) {
        case 'en_progreso':
          nuevoEstado = 'En Progreso';
          break;
        case 'finalizado':
          nuevoEstado = 'Finalizado';
          break;
        default:
          nuevoEstado = 'Pendiente';
      }

      // Actualizar el estado en el backend
      await UpdateEstado(parseInt(draggableId), nuevoEstado);

      // Actualizar el estado localmente
      const trabajoActualizado = trabajos.find(t => t.id === parseInt(draggableId));
      if (trabajoActualizado) {
        trabajoActualizado.estado = nuevoEstado;
        organizarTrabajosEnColumnas([...trabajos]);
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // Revertir visualmente si hay error
      organizarTrabajosEnColumnas(trabajos);
    }
  };

  // Convertir trabajos a formato de tareas para las cards
  const tasks = trabajos.reduce((acc, trabajo) => {
    acc[trabajo.id] = {
      id: trabajo.id,
      title: trabajo.nombre,
      description: trabajo.descripcion,
      area: trabajo.area,
      fechaInicio: new Date(trabajo.fechaInicio).toLocaleDateString(),
      fechaFin: trabajo.fechaFin ? new Date(trabajo.fechaFin).toLocaleDateString() : 'Sin fecha fin',
      priority: {
        color: columns[trabajo.estado.toLowerCase().replace(/\s+/g, '_')]?.color || '#9E9E9E'
      }
    };
    return acc;
  }, {});

  return (
    <div className="kanban-container">
    <h1>Tablero de seguimiento</h1>
    <span className="kanban-subtitle">Arrastra y suelta para cambiar el estado de los trabajos</span>
    
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.values(columns).map(column => (
            <Column 
              key={column.id} 
              column={column} 
              tasks={tasks} 
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoardtask;