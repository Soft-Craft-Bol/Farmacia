import React, { useState, useMemo } from 'react';
import { FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './EquiposList.css';
import ModalEquipo from '../../pages/equipos/ModalEquipo';

const EquiposTable = ({ data, onDelete }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPageSelection, setRowsPerPageSelection] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedEquipo, setSelectedEquipo] = useState(null);

  // Definición de columnas
  const columns = [
    {
        header: 'Foto',
        accessor: 'fotoUrl1',
        render: (row) => {
          // Encontrar la primera URL de imagen no nula
          const firstImageUrl = 
            row.fotoUrl1 || 
            row.fotoUrl2 || 
            row.fotoUrl3 || 
            row.fotoUrl4 || 
            null;
      
          return (
            <div className="equipo-foto-cell">
              {firstImageUrl ? (
                <img 
                  src={firstImageUrl.startsWith('http') ? firstImageUrl : `http://localhost:4000${firstImageUrl}`} 
                  alt={row.modelo} 
                  className="equipo-foto"
                />
              ) : (
                <div className="placeholder">Sin imagen</div>
              )}
            </div>
          );
        }
      },
    { header: 'Etiqueta', accessor: 'etiquetaActivo' },
    { header: 'Modelo', accessor: 'modelo' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Ubicación', accessor: 'ubicacion' },
    { header: 'Mantenimiento', accessor: 'tipoMantenimiento' },
    { 
      header: 'Fecha Compra', 
      accessor: 'fechaCompra',
      render: (row) => new Date(row.fechaCompra).toLocaleDateString()
    },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Orden', accessor: 'numeroOrden' },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (row) => (
        <div className="table-actions">
          <button 
            className="edit-btn" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/equipos/${row.id}`);
            }}
          >
            <FiEdit />
          </button>
          <button 
            className="delete-btn" 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
                onDelete(row.id);
              }
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      )
    }
  ];

  // Ordenar los datos
  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Verificar si los valores son números o cadenas
        const aIsNumber = !isNaN(aValue) && aValue !== null;
        const bIsNumber = !isNaN(bValue) && bValue !== null;

        if (aIsNumber && bIsNumber) {
          // Comparar numéricamente
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
          // Comparar alfabéticamente
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // Calcular datos para la página actual
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPageSelection;
    return sortedData.slice(startIndex, startIndex + rowsPerPageSelection);
  }, [currentPage, rowsPerPageSelection, sortedData]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => Math.ceil(sortedData.length / rowsPerPageSelection), [sortedData, rowsPerPageSelection]);

  // Función para manejar el orden
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Manejar cambios de página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejar cambio en la cantidad de filas por página
  const handleRowsPerPageChange = (event) => {
    setRowsPerPageSelection(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="table-container">
      <button 
        className="add-equipo-btn" 
        onClick={() => navigate("/equipos/register")}
      >
        <FiPlusCircle /> Agregar Equipo
      </button>

      <table className="equipos-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                onClick={() => column.accessor && handleSort(column.accessor)}
                className={column.accessor === sortConfig.key ? `sorted ${sortConfig.direction}` : ''}
              >
                {column.header}
                {column.accessor && sortConfig.key === column.accessor && (
                  <span className="sort-icon">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
                <tr 
                key={rowIndex} 
                onClick={() => setSelectedEquipo(row)} // Cambiar para abrir modal en lugar de navegar
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row) : row[column.accessor] || '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                No hay equipos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination-container">
        <div className="rows-per-page">
          <label htmlFor="rows-per-page">Filas por página:</label>
          <select
            id="rows-per-page"
            value={rowsPerPageSelection}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente &raquo;
          </button>
        </div>
      </div>
      {selectedEquipo && (
        <ModalEquipo
          equipo={selectedEquipo} 
          onClose={() => setSelectedEquipo(null)} 
        />
      )}
    </div>
  );
};

export default EquiposTable;