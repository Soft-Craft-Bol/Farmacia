import React from 'react';
import { FiX } from 'react-icons/fi';
import './ModalEquipo.css'; 
import { exportEquipoPDF } from '../../utils/exportEquipoPdf';


const ModalEquipo = ({ equipo, onClose }) => {
  if (!equipo) return null;

  

  // Obtener todas las imágenes no nulas
  const images = [
    equipo.fotoUrl1,
    equipo.fotoUrl2,
    equipo.fotoUrl3,
    equipo.fotoUrl4
  ].filter(url => url);

  // Obtener todos los documentos no nulos
  const documents = [
    equipo.documentoUrl1,
    equipo.documentoUrl2,
    equipo.documentoUrl3,
    equipo.documentoUrl4
  ].filter(url => url);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="modal-header">
          <h2>{equipo.etiquetaActivo}</h2>
          <span className={`estado-badge ${equipo.estado.toLowerCase().replace(' ', '-')}`}>
            {equipo.estado}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button
            onClick={() => exportEquipoPDF(equipo)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#2980b9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Exportar a PDF
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-section">
            <h3>Información Básica</h3>
            <div className="info-grid">
              <div>
                <label>Modelo:</label>
                <span>{equipo.modelo}</span>
              </div>
              <div>
                <label>Número de Serie:</label>
                <span>{equipo.numeroSerie}</span>
              </div>
              <div>
                <label>Ubicación:</label>
                <span>{equipo.ubicacion}</span>
              </div>
              <div>
                <label>Tipo de Mantenimiento:</label>
                <span>{equipo.tipoMantenimiento}</span>
              </div>
              <div>
                <label>Fecha de Compra:</label>
                <span>{new Date(equipo.fechaCompra).toLocaleDateString()}</span>
              </div>
              <div>
                <label>Proveedor:</label>
                <span>{equipo.proveedor}</span>
              </div>
              <div>
                <label>Número de Orden:</label>
                <span>{equipo.numeroOrden}</span>
              </div>
            </div>
          </div>

          {equipo.componentes && equipo.componentes.length > 0 && (
            <div className="modal-section">
              <h3>Componentes</h3>
              <ul className="componentes-list">
                {equipo.componentes.map((comp, index) => (
                  <li key={index}>{comp.nombre}</li>
                ))}
              </ul>
            </div>
          )}

          {images.length > 0 && (
            <div className="modal-section">
              <h3>Imágenes</h3>
              <div className="image-gallery">
                {images.map((imgUrl, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:4000${imgUrl}`} 
                      alt={`Imagen ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="modal-section">
              <h3>Documentos</h3>
              <div className="documents-list">
                {documents.map((docUrl, index) => {
                  const fileName = docUrl.split('/').pop();
                  return (
                    <a 
                      key={index} 
                      href={docUrl.startsWith('http') ? docUrl : `http://localhost:4000${docUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      {fileName}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEquipo;