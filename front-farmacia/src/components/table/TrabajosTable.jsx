import React, { useState, useMemo } from 'react';
import { FiFileText, FiEye } from 'react-icons/fi';
import './TrabajosList.css';
import { exportTrabajoPDF } from '../../utils/exportTrabajoPDF';

const TrabajosTable = ({ data, onExport, onVerDetalles }) => {
  const trabajosArray = Array.isArray(data?.trabajos) ? data.trabajos : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPageSelection, setRowsPerPageSelection] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  const filteredData = useMemo(() => {
    return trabajosArray.filter((trabajo) => {
      const term = searchTerm.toLowerCase();
      return (
        trabajo.nombre?.toLowerCase().includes(term) ||
        trabajo.descripcion?.toLowerCase().includes(term) ||
        trabajo.area?.toLowerCase().includes(term)
      );
    });
  }, [trabajosArray, searchTerm, estadoFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPageSelection;
    return filteredData.slice(start, start + rowsPerPageSelection);
  }, [currentPage, rowsPerPageSelection, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPageSelection);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExport = (trabajo) => {
  exportTrabajoPDF(trabajo);
};


  return (
    <div className="table-container">
      <div className="table-header-controls">
        <input
          type="text"
          placeholder="Buscar por nombre, descripción o área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <table className="trabajos-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Área</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((trabajo) => (
              <tr key={trabajo.id}>
                <td>
                  {trabajo.imagenes ? (
                    <img
                      src={trabajo.imagenes}
                      alt="Trabajo"
                      className="trabajo-img"
                      width={60}
                      height={60}
                    />
                  ) : (
                    <div className="placeholder">Sin imagen</div>
                  )}
                </td>
                <td>{trabajo.nombre}</td>
                <td>{trabajo.area}</td>
                <td>{trabajo.descripcion}</td>
                <td>{trabajo.estado}</td>
                <td>{trabajo.prioridad}</td>
                <td>{new Date(trabajo.fechaInicio).toLocaleDateString()}</td>
                <td>{new Date(trabajo.fechaFin).toLocaleDateString()}</td>
                <td>
                  <button
                    className="action-btn"
                    title="Ver PDF"
                    onClick={() => handleExport(trabajo)}
                  >
                    <FiFileText />
                  </button>
                  <button
                    className="action-btn"
                    title="Ver detalles"
                    onClick={() => onVerDetalles && onVerDetalles(trabajo)}
                  >
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">No hay trabajos disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-container">
        <div className="rows-per-page">
          <label>Filas por página:</label>
          <select
            value={rowsPerPageSelection}
            onChange={(e) => {
              setRowsPerPageSelection(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 25, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            &laquo; Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Siguiente &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrabajosTable;
