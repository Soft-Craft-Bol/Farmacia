import { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import { FaCheck, FaTimes } from "../../hooks/icons";
import { getTrabajos, updateTrabajo, getTecnicos } from "../../service/api";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import "../users/ListUser.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import Modal from "../../components/modal/Modal";
import { getUser } from "../login/authFuntions";
import Select from "../../components/select/Select";

const TrabajosPendientes = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [trabajoToUpdate, setTrabajoToUpdate] = useState(null);
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const currentUser = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trabajosResponse = await getTrabajos();
        setTrabajos(trabajosResponse.data.filter(t => t.estado === "Pendiente"));
        
        const tecnicosResponse = await getTecnicos();
        setTecnicos(tecnicosResponse.data.filter(t => t.id !== currentUser.id));
      } catch (error) {
        toast.error("Error al cargar datos");
      }
    };
    fetchData();
  }, [currentUser.id]);

  const handleUpdateStatus = async () => {
    if (action === "accept" && (!startDate || !tecnicoId)) {
      toast.error("Fecha de inicio y técnico son requeridos");
      return;
    }

    try {
      const newStatus = action === "accept" ? "Aceptado" : "Rechazado";
      const updateData = { 
        estado: newStatus,
        descripcion,
      };

      if (action === "accept") {
        updateData.fechaInicio = startDate;
        updateData.fechaFin = endDate;
        updateData.tecnicoId = tecnicoId;
      }

      await updateTrabajo(trabajoToUpdate.id, updateData);
      setTrabajos(prev => prev.filter(t => t.id !== trabajoToUpdate.id));
      toast.success(`Trabajo ${newStatus.toLowerCase()} exitosamente.`);
    } catch (error) {
      toast.error(`Error al ${action === "accept" ? "aceptar" : "rechazar"} el trabajo.`);
    } finally {
      setTrabajoToUpdate(null);
      setAction("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setTecnicoId("");
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Solicitante", accessor: "encargadoId" },
    {
      header: "Acciones",
      render: (row) => (
        <div className="trabajo-management-table-actions">
          <ButtonPrimary 
            type="success" 
            onClick={() => {
              setTrabajoToUpdate(row);
              setAction("accept");
            }}
            title="Aceptar trabajo"
          >
            <FaCheck />
          </ButtonPrimary>
          <ButtonPrimary 
            type="danger" 
            onClick={() => {
              setTrabajoToUpdate(row);
              setAction("reject");
            }}
            title="Rechazar trabajo"
          >
            <FaTimes />
          </ButtonPrimary>
        </div>
      ),
    },
  ];

  return (
    <div className="trabajo-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      
      <div className="trabajo-management-header">
        <h2 className="trabajo-management-title">Trabajos Pendientes</h2>
        <LinkButton to="/registerTrabajo">Agregar Trabajo</LinkButton>
      </div>

      <Table columns={columns} data={trabajos} className="trabajo-management-table" />

      {trabajoToUpdate && (
        <Modal isOpen={!!trabajoToUpdate} onClose={() => setTrabajoToUpdate(null)}>
          <div className="trabajo-modal-container">
            <h2 className="trabajo-modal-title">Confirmar {action === "accept" ? "Aceptación" : "Rechazo"}</h2>
            
            <p className="trabajo-modal-subtitle">Trabajo: <strong>{trabajoToUpdate.nombre}</strong></p>
            
            {action === "accept" && (
              <>
                <div className="trabajo-form-group">
                  <label className="trabajo-form-label">Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    className="trabajo-form-input"
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="trabajo-form-group">
                  <label className="trabajo-form-label">Fecha de Fin (Opcional)</label>
                  <input 
                    type="date" 
                    className="trabajo-form-input"
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    min={startDate}
                  />
                </div>
                
                <div className="trabajo-form-group">
                  <label className="trabajo-form-label">Técnico Asignado *</label>
                  <select
                    className="trabajo-form-select"
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un técnico</option>
                    {tecnicos.map(tecnico => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre} {tecnico.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div className="trabajo-form-group">
              <label className="trabajo-form-label">Descripción {action === "accept" ? "(Opcional)" : "*"}</label>
              <textarea 
                className="trabajo-form-textarea"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required={action === "reject"}
              />
            </div>
            
            <div className="trabajo-modal-actions">
              <ButtonPrimary 
                className={`trabajo-modal-btn ${action === "accept" ? "accept-btn" : "reject-btn"}`}
                onClick={handleUpdateStatus}
              >
                Confirmar {action === "accept" ? "Aceptación" : "Rechazo"}
              </ButtonPrimary>
              <ButtonPrimary 
                className="trabajo-modal-btn cancel-btn"
                onClick={() => setTrabajoToUpdate(null)}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TrabajosPendientes;