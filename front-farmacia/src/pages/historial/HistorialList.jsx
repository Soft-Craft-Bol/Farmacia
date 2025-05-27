import React, { useEffect, useState } from "react";
import { getHistorialFinalizados } from "../../service/api";
import HistorialTable from "../../components/table/TrabajosTable";
import { ModalTrabajoDetalle } from "./TrabajoDetalleModalProps";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HistorialList = () => {
  const [historial, setHistorial] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await getHistorialFinalizados();
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al obtener el historial:", error);
      }
    };

    fetchHistorial();
  }, []);

  const handleVerDetalles = (trabajo) => {
    setTrabajoSeleccionado(trabajo);
    setModalAbierto(true);
  };

  const exportTrabajoToPDF = (trabajo) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Detalle del Trabajo: ${trabajo.equipo.modelo}`, 14, 20);

    const data = [
      ["Técnico", trabajo.tecnico?.usuario?.nombreCompleto || "—"],
      ["Área", trabajo.tecnico?.area?.nombre || "—"],
      ["Tipo", trabajo.tipo || "—"],
      ["Descripción", trabajo.descripcion || "—"],
      ["Fecha Inicio", new Date(trabajo.fechaInicio).toLocaleDateString()],
      ["Fecha Fin", new Date(trabajo.fechaFin).toLocaleDateString()],
      ["Estado", trabajo.estado || "—"],
      ["Etiqueta Activo", trabajo.equipo?.etiquetaActivo || "—"],
      ["Número Serie", trabajo.equipo?.numeroSerie || "—"],
      ["Modelo", trabajo.equipo?.modelo || "—"],
    ];

    autoTable(doc, {
      startY: 30,
      body: data.map(([label, value]) => [label, value]),
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 2 },
    });

    doc.save(`trabajo_${trabajo.equipo?.etiquetaActivo || "detalle"}.pdf`);
  };

  const exportTableToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Historial de Trabajos Finalizados", 14, 20);

    const tableData = historial.map((trabajo) => [
      trabajo.tecnico?.usuario?.nombreCompleto || "—",
      trabajo.tipo || "—",
      trabajo.equipo?.etiquetaActivo || "—",
      trabajo.equipo?.modelo || "—",
      new Date(trabajo.fechaInicio).toLocaleDateString(),
      new Date(trabajo.fechaFin).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Técnico", "Tipo", "Etiqueta", "Modelo", "Inicio", "Fin"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("historial_trabajos.pdf");
  };

  return (
    <div className="historial-list-container">
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
          }}
        >
          Exportar Tabla a PDF
        </button>
      </div>

      <HistorialTable
        data={historial}
        onExport={exportTrabajoToPDF}
        onVerDetalles={handleVerDetalles}
      />

      <ModalTrabajoDetalle
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        trabajo={trabajoSeleccionado}
      />
    </div>
  );
};

export default HistorialList;
