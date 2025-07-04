import { useState, useEffect, useMemo } from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaList,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { Toaster, toast } from "sonner";
import Table from "../../components/table/Table";
import { getTrabajos, deleteTrabajo } from "../../service/api";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import LinkButton from "../../components/buttons/LinkButton";
import "./TrabajoList.css";

const TrabajoManagement = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trabajoToDelete, setTrabajoToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({
    todos: true,
    pendientes: true,
    enProgreso: true,
    finalizados: true
  });

  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        const response = await getTrabajos();
        setTrabajos(response.data);
      } catch (error) {
        toast.error("Error al cargar los trabajos");
      } finally {
        setLoading(false);
      }
    };
    fetchTrabajos();
  }, []);

  const handleDeleteTrabajo = async () => {
    try {
      await deleteTrabajo(trabajoToDelete.id);
      setTrabajos(prev => prev.filter(t => t.id !== trabajoToDelete.id));
      toast.success("Trabajo eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el trabajo");
    } finally {
      setDeleteConfirmOpen(false);
      setTrabajoToDelete(null);
    }
  };

  const toggleSection = (section) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const columns = useMemo(() => [
    { header: "ID", accessor: "id", width: "80px" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Descripción", accessor: "descripcion", width: "30%" },
    { header: "Fecha Inicio", accessor: "fechaInicio" },
    { header: "Fecha Fin", accessor: "fechaFin" },
    { 
      header: "Estado", 
      accessor: "estado",
      render: (row) => (
        <span className={`status-badge ${row.estado.toLowerCase().replace(' ', '-')}`}>
          {row.estado === 'Pendiente' && <FaClock />}
          {row.estado === 'En Progreso' && <FaSpinner className="spin" />}
          {row.estado === 'Finalizado' && <FaCheckCircle />}
          {row.estado}
        </span>
      )
    },
    {
      header: "Acciones",
      width: "120px",
      render: (row) => (
        <div className="actions">
          <button 
            onClick={() => {/* Tu lógica de edición aquí */}}
            className="action-btn edit"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => {
              setTrabajoToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="action-btn delete"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], []);

  // Filtrar trabajos
  const trabajosPendientes = trabajos.filter(t => t.estado === "Pendiente");
  const trabajosEnProgreso = trabajos.filter(t => t.estado === "En Progreso");
  const trabajosFinalizados = trabajos.filter(t => t.estado === "Finalizado");

  return (
    <div className="trabajo-management-container">
      <Toaster position="top-right" richColors />
      
      <div className="header-container">
        <h1>
          <FaList /> Gestión de Trabajos
        </h1>
        
        <button 
          className="add-button"
          onClick={() => {/* Tu lógica para agregar nuevo trabajo */}}
        >
          <FaPlus /> Nuevo Trabajo
        </button>
        <div className="trabajo-management-header">
        <h2 className="trabajo-management-title">Trabajos Pendientes</h2>
        <LinkButton to={`/trabajos/pendientes`}>Gestionar pendientes</LinkButton>
      </div>
      </div>

      <div className="section-controls">
        <button 
          onClick={() => toggleSection('todos')}
          className={`section-toggle ${visibleSections.todos ? 'active' : ''}`}
        >
          {visibleSections.todos ? <FaEye /> : <FaEyeSlash />} Todos
        </button>
        
        <button 
          onClick={() => toggleSection('pendientes')}
          className={`section-toggle ${visibleSections.pendientes ? 'active' : ''}`}
        >
          {visibleSections.pendientes ? <FaEye /> : <FaEyeSlash />} Pendientes ({trabajosPendientes.length})
        </button>
        
        <button 
          onClick={() => toggleSection('enProgreso')}
          className={`section-toggle ${visibleSections.enProgreso ? 'active' : ''}`}
        >
          {visibleSections.enProgreso ? <FaEye /> : <FaEyeSlash />} En Progreso ({trabajosEnProgreso.length})
        </button>
        
        <button 
          onClick={() => toggleSection('finalizados')}
          className={`section-toggle ${visibleSections.finalizados ? 'active' : ''}`}
        >
          {visibleSections.finalizados ? <FaEye /> : <FaEyeSlash />} Finalizados ({trabajosFinalizados.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando trabajos...</div>
      ) : (
        <>
          {visibleSections.todos && (
            <div className="section">
              <h2>
                <FaList /> Todos los Trabajos ({trabajos.length})
              </h2>
              <Table 
                columns={columns} 
                data={trabajos} 
                emptyMessage="No hay trabajos registrados"
              />
            </div>
          )}

          {visibleSections.pendientes && (
            <div className="section">
              <h2>
                <FaClock /> Trabajos Pendientes ({trabajosPendientes.length})
              </h2>
              <Table 
                columns={columns} 
                data={trabajosPendientes} 
                emptyMessage="No hay trabajos pendientes"
              />
            </div>
          )}

          {visibleSections.enProgreso && (
            <div className="section">
              <h2>
                <FaSpinner className="spin" /> Trabajos en Progreso ({trabajosEnProgreso.length})
              </h2>
              <Table 
                columns={columns} 
                data={trabajosEnProgreso} 
                emptyMessage="No hay trabajos en progreso"
              />
            </div>
          )}

          {visibleSections.finalizados && (
            <div className="section">
              <h2>
                <FaCheckCircle /> Trabajos Finalizados ({trabajosFinalizados.length})
              </h2>
              <Table 
                columns={columns} 
                data={trabajosFinalizados} 
                emptyMessage="No hay trabajos finalizados"
              />
            </div>
          )}
        </>
      )}

      {deleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de eliminar el trabajo "{trabajoToDelete?.nombre}"?</p>
            <div className="modal-actions">
              <ButtonPrimary 
                onClick={handleDeleteTrabajo}
                style={{ backgroundColor: '#e74c3c' }}
              >
                <FaTrash /> Eliminar
              </ButtonPrimary>
              <ButtonPrimary 
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabajoManagement;