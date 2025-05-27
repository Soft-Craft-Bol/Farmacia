import { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import { FaCheck, FaTimes } from "../../hooks/icons";
import { getTrabajos, rechazarTrabajo, aceptarTrabajo, getTecnicos } from "../../service/api";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import "../users/ListUser.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import Modal from "../../components/modal/Modal";
import { getUser } from "../login/authFuntions";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trabajosResponse, tecnicosResponse] = await Promise.all([
          getTrabajos(),
          getTecnicos()
        ]);
        
        setTrabajos(trabajosResponse.data.filter(t => t.estado === "Pendiente"));
        // Mostrar todos los técnicos sin filtrar
        setTecnicos(tecnicosResponse.data);
      } catch (error) {
        toast.error("Error al cargar datos: " + (error.message || "Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAction = (trabajo, actionType) => {
    setTrabajoToUpdate(trabajo);
    setAction(actionType);
    // Resetear campos al cambiar de acción
    setStartDate("");
    setEndDate("");
    setDescription("");
    setTecnicoId("");
  };

  const handleUpdateStatus = async () => {
    if (!trabajoToUpdate) return;
    
    setIsLoading(true);
    try {
      if (action === "accept") {
        if (!startDate || !tecnicoId) {
        throw new Error("Fecha de inicio y técnico son requeridos");
      }

      const response = await aceptarTrabajo(trabajoToUpdate.id, {
        tecnicoId: parseInt(tecnicoId),
        encargadoId: trabajoToUpdate.encargadoId,
        fechaInicio: startDate,
        fechaFin: endDate || null,
        descripcion: description || null
      });

      toast.success(response.data?.message || "Trabajo aceptado correctamente");
      } else {
        if (!description) {
          throw new Error("El motivo del rechazo es requerido");
        }

        const response = await rechazarTrabajo(trabajoToUpdate.id, {
          motivo: description,
          encargadoId: trabajoToUpdate.encargadoId // Enviamos el ID del solicitante original
        });

        toast.success(response.data?.message || "Trabajo rechazado correctamente");
      }

      // Actualizar lista eliminando el trabajo procesado
      setTrabajos(prev => prev.filter(t => t.id !== trabajoToUpdate.id));
      setTrabajoToUpdate(null);
      
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Error al procesar la solicitud");
      console.error("Error al actualizar el trabajo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resto del código permanece igual...
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
            onClick={() => handleAction(row, "accept")}
            title="Aceptar trabajo"
            disabled={isLoading}
          >
            <FaCheck />
          </ButtonPrimary>
          <ButtonPrimary 
            type="danger" 
            onClick={() => handleAction(row, "reject")}
            title="Rechazar trabajo"
            disabled={isLoading}
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

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <Table columns={columns} data={trabajos} className="trabajo-management-table" />
      )}

      {trabajoToUpdate && (
        <Modal isOpen={!!trabajoToUpdate} onClose={() => !isLoading && setTrabajoToUpdate(null)}>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
                
                <div className="trabajo-form-group">
                  <label className="trabajo-form-label">Técnico Asignado *</label>
                  <select
                    className="trabajo-form-select"
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    required
                    disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            
            <div className="trabajo-modal-actions">
              <ButtonPrimary 
                className={`trabajo-modal-btn ${action === "accept" ? "accept-btn" : "reject-btn"}`}
                onClick={handleUpdateStatus}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : `Confirmar ${action === "accept" ? "Aceptación" : "Rechazo"}`}
              </ButtonPrimary>
              <ButtonPrimary 
                className="trabajo-modal-btn cancel-btn"
                onClick={() => !isLoading && setTrabajoToUpdate(null)}
                disabled={isLoading}
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