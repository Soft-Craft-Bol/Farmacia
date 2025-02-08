import React, { useEffect, useState } from "react";
import { getEquipos, deleteEquipo } from "../../service/api";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";
import "./EquiposList.css";

const EquiposList = () => {
  const [equipos, setEquipos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await getEquipos();
        setEquipos(response.data);
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    };

    fetchEquipos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      try {
        await deleteEquipo(id);
        setEquipos(equipos.filter((equipo) => equipo.id !== id));
      } catch (error) {
        console.error("Error al eliminar el equipo:", error);
      }
    }
  };

  return (
    <div className="equipos-container">
      {/* Botón de agregar equipo */}
      <button className="add-equipo-btn" onClick={() => navigate("/equipos/register")}>
        <FiPlusCircle /> Agregar Equipo
      </button>

      {/* Lista de equipos */}
      <div className="equipos-grid">
        {equipos.length === 0 ? (
          <p className="no-equipos">No hay equipos disponibles.</p>
        ) : (
          equipos.map((equipo) => (
            <div key={equipo.id} className="equipo-card">
              <div className="equipo-info">
                <h3>{equipo.etiquetaActivo}</h3>
                <div className="equipo-foto">
                  {equipo.fotoUrl ? (
                    <img src={equipo.fotoUrl} alt={equipo.modelo} />
                  ) : (
                    <div className="placeholder">Sin imagen</div>
                  )}
                </div>
                <p><strong>Modelo:</strong> {equipo.modelo}</p>
                <p><strong>Estado:</strong> {equipo.estado}</p>
                <p><strong>Ubicación:</strong> {equipo.ubicacion}</p>
                <p><strong>Mantenimiento:</strong> {equipo.tipoMantenimiento}</p>
                <p><strong>Fecha de compra:</strong> {new Date(equipo.fechaCompra).toLocaleDateString()}</p>
                <p><strong>Proveedor:</strong> {equipo.proveedor}</p>
                <p><strong>Número de orden:</strong> {equipo.numeroOrden}</p>
              </div>

              {/* Botones de acción */}
              <div className="equipo-actions">
                <button className="edit-btn" onClick={() => navigate(`/editar-equipo/${equipo.id}`)}>
                  <FiEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(equipo.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquiposList;
