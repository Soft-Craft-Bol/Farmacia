import React, { useEffect, useState } from "react";
import { getEquipos, deleteEquipo } from "../../service/api";
import EquiposTable from "../../components/table/EquiposTable ";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EquiposList = () => {
  const [equipos, setEquipos] = useState([]);

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
    try {
      await deleteEquipo(id);
      setEquipos(equipos.filter((equipo) => equipo.id !== id));
    } catch (error) {
      console.error("Error al eliminar el equipo:", error);
    }
  };

  const exportEquipoToPDF = (equipo) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Ficha Técnica: ${equipo.modelo}`, 14, 20);

    const data = [
      ["Etiqueta de Activo", equipo.etiquetaActivo],
      ["Número de Serie", equipo.numeroSerie],
      ["Modelo", equipo.modelo],
      ["Estado", equipo.estado],
      ["Ubicación", equipo.ubicacion],
      ["Tipo de Mantenimiento", equipo.tipoMantenimiento],
      ["Fecha de Compra", new Date(equipo.fechaCompra).toLocaleDateString()],
      ["Proveedor", equipo.proveedor],
      ["Número de Orden", equipo.numeroOrden],
    ];

    autoTable(doc, {
      startY: 30,
      body: data.map(([label, value]) => [label, value || ""]),
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 2 },
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    if (equipo.componentes && equipo.componentes.length > 0) {
      doc.text("Componentes:", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Nombre"]],
        body: equipo.componentes.map((comp) => [comp.nombre]),
        theme: "grid",
      });
    }

    doc.save(`equipo_${equipo.etiquetaActivo}.pdf`);
  };

  // ✅ Exportar tabla completa a PDF
  const exportTableToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Listado Completo de Equipos", 14, 20);

    const tableData = equipos.map((equipo) => [
      equipo.etiquetaActivo,
      equipo.numeroSerie,
      equipo.modelo,
      equipo.estado,
      equipo.ubicacion,
      equipo.tipoMantenimiento,
      new Date(equipo.fechaCompra).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Activo", "Serie", "Modelo", "Estado", "Ubicación", "Mantenimiento", "Fecha Compra"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("listado_equipos.pdf");
  };

  return (
    <div className="equipos-list-container">
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={exportTableToPDF}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Exportar Tabla a PDF
        </button>
      </div>

      <EquiposTable
        data={equipos}
        onDelete={handleDelete}
        onExport={exportEquipoToPDF}
      />
    </div>
  );
};

export default EquiposList;
