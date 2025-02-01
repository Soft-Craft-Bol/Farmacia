import React, { useState } from 'react';
import './TableFilter.css';

const TableFilter = ({ columns, onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (column, value) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    onReset();
  };

  return (
    <div className="table-filter">
      {columns.map((column, index) => (
        <div key={index} className="filter-group">
          <label>{column.header}</label>
          <select
            value={filters[column.accessor] || ''}
            onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
          >
            <option value="">All</option>
            {/* Aquí puedes añadir opciones según el tipo de columna */}
            <option value="Electric">Electric</option>
            <option value="Book">Book</option>
            <option value="Processing">Administrador</option>
            <option value="Completed">202201712@est.umss.edu</option>
            {/* Agrega más opciones según los datos */}
          </select>
        </div>
      ))}
      <button className="reset-filter" onClick={resetFilters}>
        Reset Filter
      </button>
    </div>
  );
};

export default TableFilter;
