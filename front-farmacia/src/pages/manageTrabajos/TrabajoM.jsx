import { useState } from "react";
import { Toaster } from "sonner";
import Table from "../../components/table/Table";
import Button from "../../components/buttons/Button";
import { FaEdit, FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const TrabajoList = ({ trabajos, onDelete, title, icon, emptyMessage }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trabajoToDelete, setTrabajoToDelete] = useState(null);

  const columns = [
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
          {row.estado}
        </span>
      )
    },
    {
      header: "Acciones",
      width: "120px",
      render: (row) => (
        <div className="actions">
          <NavLink 
            to={`/editTrabajo/${row.id}`} 
            className="action-btn edit"
            title="Editar"
          >
            <FaEdit />
          </NavLink>
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
  ];

  const handleConfirmDelete = () => {
    onDelete(trabajoToDelete);
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="trabajo-list-container">
      <Toaster position="top-right" richColors />
      
      <h1>
        {icon} {title}
      </h1>

      <Table 
        columns={columns} 
        data={trabajos} 
        emptyMessage={emptyMessage}
      />

      {deleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de eliminar el trabajo "{trabajoToDelete?.nombre}"?</p>
            <div className="modal-actions">
              <Button 
                onClick={handleConfirmDelete}
                style={{ backgroundColor: '#e74c3c' }}
              >
                <FaTrash /> Eliminar
              </Button>
              <Button 
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabajoList;