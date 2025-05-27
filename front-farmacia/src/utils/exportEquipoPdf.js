import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BASE_URL = 'http://localhost:4000'

export async function exportEquipoPDF(equipo) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const title = `Reporte del equipo: ${equipo.etiquetaActivo}`
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 20)
  drawLine(doc, 14, 22, pageWidth - 14) // Línea divisoria

  // Información general
  const generalData = [
    ['Número de serie', equipo.numeroSerie || 'N/A'],
    ['Modelo', equipo.modelo || 'N/A'],
    ['Estado', equipo.estado || 'N/A'],
    ['Ubicación', equipo.ubicacion || 'N/A'],
    ['Tipo de mantenimiento', equipo.tipoMantenimiento || 'N/A'],
    ['Fecha de compra', new Date(equipo.fechaCompra).toLocaleDateString()],
    ['Proveedor', equipo.proveedor || 'N/A'],
    ['Número de orden', equipo.numeroOrden || 'N/A'],
    ['Horas de uso acumuladas', equipo.horasUsoAcumuladas?.toString() || '0'],
    ['Periodo mantenimiento (días)', equipo.periodoMantenimiento?.toString() || 'No definido'],
  ]

  autoTable(doc, {
    startY: 30,
    head: [['Campo', 'Valor']],
    body: generalData,
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: 'left',
    },
    bodyStyles: {
      halign: 'left',
    },
    styles: {
      fontSize: 10,
    },
  })

  let currentY = doc.lastAutoTable.finalY + 10

  if (equipo.componentes?.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Componentes', 14, currentY)
    drawLine(doc, 14, currentY + 2, pageWidth - 14)

    autoTable(doc, {
      startY: currentY + 6,
      head: [['ID', 'Nombre']],
      body: equipo.componentes.map((c) => [c.id, c.nombre]),
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 10 },
    })

    currentY = doc.lastAutoTable.finalY + 10
  }

  const imagenes = [equipo.fotoUrl1, equipo.fotoUrl2, equipo.fotoUrl3, equipo.fotoUrl4].filter(Boolean)
  for (let i = 0; i < imagenes.length; i++) {
    const url = imagenes[i].startsWith('http') ? imagenes[i] : `${BASE_URL}${imagenes[i]}`

    try {
      const imgData = await toBase64(url)
      const imgType = getImageMimeType(imgData)

      if (imgType) {
        doc.addPage()

        const imageWidth = 140
        const imageHeight = 90
        const x = (pageWidth - imageWidth) / 2

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Foto ${i + 1}`, 14, 20)
        drawLine(doc, 14, 22, pageWidth - 14)

        doc.addImage(imgData, imgType, x, 30, imageWidth, imageHeight)
      }
    } catch (e) {
      console.error('Error al cargar imagen:', url, e)
    }
  }

  const documentos = [equipo.documentoUrl1, equipo.documentoUrl2, equipo.documentoUrl3, equipo.documentoUrl4].filter(Boolean)
  if (documentos.length > 0) {
    doc.addPage()
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Documentos adjuntos:', 14, 20)
    drawLine(doc, 14, 22, pageWidth - 14)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 255)

    documentos.forEach((docUrl, index) => {
      const fullUrl = docUrl.startsWith('http') ? docUrl : `${BASE_URL}${docUrl}`
      doc.textWithLink(`Documento ${index + 1}`, 14, 30 + index * 10, { url: fullUrl })
    })
  }

  doc.save(`equipo_${equipo.id}_${equipo.etiquetaActivo}.pdf`)
}

async function toBase64(url) {
  const response = await fetch(url, { mode: 'cors' })
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getImageMimeType(dataUrl) {
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG'
  if (dataUrl.startsWith('data:image/png')) return 'PNG'
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP'
  return null
}

// Dibuja línea horizontal
function drawLine(doc, xStart, y, xEnd) {
  doc.setLineWidth(0.3)
  doc.setDrawColor(200)
  doc.line(xStart, y, xEnd, y)
}
