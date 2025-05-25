import { useState, useEffect, useMemo } from "react";
import Table from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getTrabajos,  deleteTrabajo } from "../../service/api";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import LinkButton from "../../components/buttons/LinkButton";
import { getUserById } from "../../service/api";
import "./ListUser.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";

const TrabajoManagement = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trabajoToDelete, setTrabajoToDelete] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchTrabajos = async () => {
      const response = await getTrabajos();
      setTrabajos(response.data);
    };
    fetchTrabajos();
  }, []);

  const handleDeleteTrabajo = async () => {
    try {
      await deleteTrabajo(trabajoToDelete.id);
      setTrabajos((prevTrabajos) =>
        prevTrabajos.filter((trabajo) => trabajo.id !== trabajoToDelete.id)
      );
      toast.success("Trabajo eliminado exitosamente.");
    } catch (error) {
      toast.error("Error al eliminar el trabajo.");
    } finally {
      setDeleteConfirmOpen(false);
      setTrabajoToDelete(null);
    }
  };

  const confirmDeleteTrabajo = (trabajo) => {
    setTrabajoToDelete(trabajo);
    setDeleteConfirmOpen(true);
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { header: "Nombre", accessor: "nombre" },
      { header: "Descripción", accessor: "descripcion" },
      { header: "Fecha Inicio", accessor: "fechaInicio" },
      { header: "Fecha Fin", accessor: "fechaFin" },
      { header: "Estado", accessor: "estado" },
      {
        header: "Acciones",
        render: (row) => (
          <div className="trabajo-management-table-actions">
            <Link to={`/editTrabajo/${row.id}`} className="trabajo-management-edit-work">
              <FaEdit />
            </Link>
            <ButtonPrimary
              type="danger"
              onClick={() => confirmDeleteTrabajo(row)}
            >
              <MdDelete />
            </ButtonPrimary>
          </div>
        ),
      },
    ],
    []
  );

  // Filtrar trabajos por estado
  const trabajosPendientes = trabajos.filter((trabajo) => trabajo.estado === "Pendiente");
  const trabajosEnProgreso = trabajos.filter((trabajo) => trabajo.estado === "En Progreso");
  const trabajosFinalizados = trabajos.filter((trabajo) => trabajo.estado === "Finalizado");

  return (
    <div className="trabajo-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="trabajo-management-header">
        <h2 className="trabajo-management-title">Gestión de Trabajos</h2>
        <LinkButton to={`/registerTrabajo`}>Agregar Trabajo</LinkButton>
      </div>
 <div className="trabajo-management-header">
        <h2 className="trabajo-management-title">Trabajos Pendientes</h2>
        <LinkButton to={`/trabajos/pendientes`}>Gestionar pendientes</LinkButton>
      </div>
      {/* Tabla de Trabajos Pendientes */}
      <h3>Trabajos Pendientes</h3>
      <Table columns={columns} data={trabajosPendientes} className="trabajo-management-table" />

      {/* Tabla de Trabajos en Progreso */}
      <h3>Trabajos en Progreso</h3>
      <Table columns={columns} data={trabajosEnProgreso} className="trabajo-management-table" />

      {/* Tabla de Trabajos Finalizados */}
      <h3>Trabajos Finalizados</h3>
      <Table columns={columns} data={trabajosFinalizados} className="trabajo-management-table" />

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmOpen && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro de que deseas eliminar este trabajo?</p>
          <div className="trabajo-management-table-actions">
            <ButtonPrimary type="danger" onClick={handleDeleteTrabajo}>
              Confirmar
            </ButtonPrimary>
            <ButtonPrimary type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </ButtonPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TrabajoManagement;
