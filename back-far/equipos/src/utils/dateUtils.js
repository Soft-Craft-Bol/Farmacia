module.exports = {
  calcularProximoMantenimiento: (fechaReferencia, periodoMeses) => {
    // Asegurarnos de que la fecha de referencia es un objeto Date válido
    const fecha = new Date(fechaReferencia);
    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha de referencia inválida');
    }

    const nuevaFecha = new Date(fecha);
    
    const mesActual = nuevaFecha.getMonth();
    const nuevoMes = mesActual + parseInt(periodoMeses);
    
    nuevaFecha.setFullYear(
      nuevaFecha.getFullYear() + Math.floor(nuevoMes / 12),
      nuevoMes % 12,
      nuevaFecha.getDate()
    );

    return nuevaFecha;
  },

  calcularDiasRestantes: (fechaFutura) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizamos a inicio de día
    
    const fecha = new Date(fechaFutura);
    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha futura inválida');
    }
    fecha.setHours(0, 0, 0, 0);
    
    const diffTime = fecha - hoy;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  formatearFecha: (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};