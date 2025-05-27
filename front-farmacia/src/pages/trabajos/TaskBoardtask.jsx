import React, { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { UpdateEstado, getTrabajosByUser, getTrababjosPendienteRechazado } from "../../service/api";
import { getUser } from "../login/authFuntions";
import Column from "./Column";
import FinalizarTrabajoForm from "./FinalizarTrabajoForm"; // Importamos el componente del formulario
import Modal from "../../components/modal/Modal"; // Asumo que tienes un componente Modal básico
import "./Taskboardtask.css";

const TaskBoardtask = () => {
  const [trabajos, setTrabajos] = useState([]);
  const currentUser = getUser();
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
    },
    rechazado: {
      id: "rechazado",
      title: "Rechazado",
      taskIds: [],
      color: "#F44336"
    }
  });

  // Estado para controlar el modal
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState(null);
  const [dragResult, setDragResult] = useState(null);

  console.log("Current User:", currentUser.roles[0] || "Sin rol asignado");
  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        if (!currentUser) return;

        if (currentUser.roles[0] === 'Administrador') {
          const response = await getTrababjosPendienteRechazado();
          console.log("Trabajos para administrador:", response.data);

          const trabajosAdmin = response.data?.data || [];

          const trabajosFormateados = trabajosAdmin.map(trabajo => ({
            ...trabajo,
            fechaInicio: trabajo.fechaInicio || new Date(),
            fechaFin: trabajo.fechaFin || null,
            asignacionId: null // Los administradores no tienen asignación
          }));

          setTrabajos(trabajosFormateados);
          organizarTrabajosEnColumnas(trabajosFormateados);
        }
        // Si es técnico
        else if (currentUser.idUser) {
          const response = await getTrabajosByUser(currentUser.idUser);
          const asignaciones = response?.data?.asignaciones || [];

          const trabajosAsignados = asignaciones.map(asignacion => ({
            ...(asignacion.trabajo || {}),
            fechaInicio: asignacion.fechaInicio,
            fechaFin: asignacion.fechaFin,
            asignacionId: asignacion.id
          })).filter(trabajo => trabajo.id);

          setTrabajos(trabajosAsignados);
          organizarTrabajosEnColumnas(trabajosAsignados);
        }
      } catch (error) {
        console.error("Error al obtener trabajos:", error);
        setTrabajos([]);
      }
    };
    fetchTrabajos();
  }, []);

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

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    setDragResult(result);

    if (currentUser.roles[0] !== 'Administrador') {
      if (destination.droppableId === 'finalizado') {
        const trabajo = trabajos.find(t => t.id === parseInt(draggableId));
        setTrabajoSeleccionado(trabajo);
        setShowFinalizarModal(true);
      } else {
        actualizarEstadoTrabajo(result);
      }
    }
  };

  const actualizarEstadoTrabajo = async (result) => {
    const { destination, draggableId } = result;

    try {
      let nuevoEstado;
      switch (destination.droppableId) {
        case 'en_progreso':
          nuevoEstado = 'En Progreso';
          break;
        case 'finalizado':
          nuevoEstado = 'Finalizado';
          break;
        default:
          nuevoEstado = 'Pendiente';
      }

      await UpdateEstado(parseInt(draggableId), nuevoEstado);

      const trabajoActualizado = trabajos.find(t => t.id === parseInt(draggableId));
      if (trabajoActualizado) {
        trabajoActualizado.estado = nuevoEstado;
        organizarTrabajosEnColumnas([...trabajos]);
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      organizarTrabajosEnColumnas(trabajos);
    }
  };

  const handleFinalizacionSuccess = (responseData) => {
    if (trabajoSeleccionado && dragResult) {
      const trabajoActualizado = trabajos.find(t => t.id === trabajoSeleccionado.id);
      if (trabajoActualizado) {
        trabajoActualizado.estado = 'Finalizado';
        organizarTrabajosEnColumnas([...trabajos]);
      }
    }

    setShowFinalizarModal(false);
    setTrabajoSeleccionado(null);
    setDragResult(null);

    console.log("Trabajo finalizado exitosamente:", responseData);
  };

  const handleFinalizacionError = (error) => {
    console.error("Error al finalizar trabajo:", error);
    setShowFinalizarModal(false);
    setTrabajoSeleccionado(null);
    setDragResult(null);

  };

  const tasks = trabajos.reduce((acc, trabajo) => {
    if (!trabajo.id) return acc;

    acc[trabajo.id] = {
      id: trabajo.id,
      title: trabajo.nombre || 'Sin nombre',
      description: trabajo.descripcion || `Prioridad: ${trabajo.prioridad || 'No especificada'}`,
      area: trabajo.area || 'Sin área asignada',
      fechaInicio: trabajo.fechaInicio ? new Date(trabajo.fechaInicio).toLocaleDateString() : 'Sin fecha inicio',
      fechaFin: trabajo.fechaFin ? new Date(trabajo.fechaFin).toLocaleDateString() : 'Sin fecha fin',
      priority: {
        color: columns[trabajo.estado?.toLowerCase().replace(/\s+/g, '_')]?.color || '#9E9E9E'
      },
      asignacionId: trabajo.asignacionId,
      observaciones: trabajo.observaciones
    };
    return acc;
  }, {});

  return (
    <div className="kanban-container">
      <h1>Tablero de seguimiento</h1>
      <span className="kanban-subtitle">
        {currentUser.roles[0] === 'Administrador'
          ? 'Vista de administrador: Pendientes y Rechazados'
          : 'Arrastra y suelta para cambiar el estado de tus trabajos'}
      </span>

      {currentUser && (
        <div className="user-info">
          <p>
            {currentUser.roles[0] === 'Administrador'
              ? 'Vista de administrador'
              : `Trabajos asignados a:${currentUser.full_name || `Usuario #${currentUser.idUser}`}`}
          </p>
          <img
            src={currentUser.photo || '/default-avatar.png'}
            alt="Avatar"
            className="user-avatar"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <p>Total trabajos: {Array.isArray(trabajos) ? trabajos.length : 0}</p>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.values(columns)
            .filter(column => {
              if (currentUser.roles[0] === 'Administrador') {
                return ['pendiente', 'rechazado'].includes(column.id);
              }
              return ['en_progreso', 'finalizado'].includes(column.id);
            })
            .map(column => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                isDraggable={currentUser.roles[0] !== 'Administrador'}
              />
            ))}
        </div>
      </DragDropContext>

      {currentUser.roles[0] !== 'Administrador' && (
        <Modal
          isOpen={showFinalizarModal}
          onClose={() => {
            setShowFinalizarModal(false);
            setTrabajoSeleccionado(null);
            setDragResult(null);
          }}
          title={`Finalizar Trabajo #${trabajoSeleccionado?.id || ''}`}
        >
          {trabajoSeleccionado && currentUser && (
            <FinalizarTrabajoForm
              trabajoId={trabajoSeleccionado.id}
              tecnicoId={currentUser.idUser}
              onSuccess={handleFinalizacionSuccess}
              onError={handleFinalizacionError}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default TaskBoardtask;