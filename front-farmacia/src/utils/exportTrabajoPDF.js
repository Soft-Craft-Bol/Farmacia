import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportTrabajoPDF = async (trabajo) => {
  // 1. Renderizar el modal en un contenedor oculto o usar el existente (mejor en un div oculto)
  //    Por simplicidad asumimos que tienes el div con id 'modal-trabajo-detalle' en DOM

  const input = document.getElementById("modal-trabajo-detalle");
  if (!input) {
    alert("No se encontró el contenido para generar PDF");
    return;
  }

  // 2. Antes de capturar el canvas, convierte las imágenes a base64 y sustitúyelas
  // (O puedes usar html2canvas directamente, que intentará dibujar la imagen aunque sea URL)
  
  // 3. Captura el contenido en canvas
  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,  // importante para cargar imágenes cross-origin
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "pt", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("detalle-trabajo.pdf");
};
