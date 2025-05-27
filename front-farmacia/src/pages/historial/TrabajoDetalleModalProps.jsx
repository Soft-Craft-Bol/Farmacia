import React from "react";
import "./ModalTrabajoDetalle.css";

export const ModalTrabajoDetalle = ({ abierto, onClose, trabajo }) => {
  if (!abierto || !trabajo) return null;

  const {
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    area,
    estado,
    prioridad,
    imagenes,
    encargadoNombre,
    historial = [],
    asignaciones = [],
  } = trabajo;

  const formatFecha = (fechaStr) =>
    fechaStr ? new Date(fechaStr).toLocaleString() : "-";

  return (
    <div className="modal-trabajo-detalle-overlay">
      <div className="modal-trabajo-detalle-container">
        <button className="modal-trabajo-detalle-close" onClick={onClose}>
          ✕
        </button>
        <h2>Detalles del Trabajo</h2>
        <p className="modal-trabajo-detalle-subtitle">Información completa del trabajo finalizado</p>

        <div className="modal-trabajo-detalle-section">
          <strong>Nombre:</strong>
          <p>{nombre}</p>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Área:</strong>
          <p>{area}</p>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Encargado:</strong>
          <p>{encargadoNombre || "No asignado"}</p>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Descripción:</strong>
          <p>{descripcion}</p>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Fechas:</strong>
          <p>Inicio: {formatFecha(fechaInicio)}</p>
          <p>Fin: {formatFecha(fechaFin)}</p>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Estado:</strong> <p>{estado}</p>
          <strong>Prioridad:</strong> <p>{prioridad}</p>
        </div>

        {imagenes && (
          <div className="modal-trabajo-detalle-section">
            <strong>Imagen principal:</strong>
            <img
              src={imagenes}
              alt="Imagen trabajo"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          </div>
        )}

        <div className="modal-trabajo-detalle-section">
          <strong>Historial:</strong>
          <ul>
            {historial.map((h) => {
              let metadataParsed = null;
              if (h.metadata) {
                try {
                  metadataParsed = JSON.parse(h.metadata);
                } catch (error) {
                  console.warn("Error parsing metadata:", error);
                }
              }

              return (
                <li key={h.id} style={{ marginBottom: "15px" }}>
                  <div>
                    <strong>{formatFecha(h.fechaCambio)} - {h.estado}</strong> by {h.usuarioNombre}
                  </div>
                  <div>Comentario: {h.comentario || "-"}</div>

                  {metadataParsed?.documentos?.length > 0 && (
                    <div>
                      <strong>Documentos:</strong>
                      <ul>
                        {metadataParsed.documentos.map((docUrl, i) => (
                          <li key={i}>
                            <a href={docUrl} target="_blank" rel="noopener noreferrer">
                              Documento {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metadataParsed?.imagenes?.length > 0 && (
                    <div>
                      <strong>Imágenes:</strong>
                      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                        {metadataParsed.imagenes.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt={`Imagen ${i + 1}`}
                            style={{ width: "100px", borderRadius: "4px" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="modal-trabajo-detalle-section">
          <strong>Asignaciones:</strong>
          <ul>
            {asignaciones.map((asig) => (
              <li key={asig.id}>
                {asig.nombre} - {asig.descripcion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
