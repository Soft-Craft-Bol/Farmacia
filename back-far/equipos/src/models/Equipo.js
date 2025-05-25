class Equipo {
  constructor(tipo, fechaAdquisicion, fechaInicioUso, intervaloTeorico = null) {
    this.tipo = tipo;
    this.fechaAdquisicion = new Date(fechaAdquisicion);
    this.fechaInicioUso = new Date(fechaInicioUso);
    this.mantenimientos = [];
    this.intervaloTeorico = intervaloTeorico || this.obtenerIntervaloTeorico();
  }

  obtenerIntervaloTeorico() {
    // Intervalos teóricos en meses
    const intervalos = {
      'laptop': 60,
      'monitor': 12,
      'impresora': 24,
      // Agregar más tipos según sea necesario
    };
    
    return intervalos[this.tipo.toLowerCase()] || 12; // Default 12 meses
  }

  agregarMantenimiento(fecha, tipo = 'preventivo', descripcion = '') {
    this.mantenimientos.push({
      fecha: new Date(fecha),
      tipo,
      descripcion
    });
    // Ordenar cronológicamente
    this.mantenimientos.sort((a, b) => a.fecha - b.fecha);
  }

  predecirProximoMantenimiento() {
    if (this.mantenimientos.length === 0) {
      // Si no hay historial, usar intervalo teórico desde inicio de uso
      const fechaPredicha = new Date(this.fechaInicioUso);
      fechaPredicha.setMonth(fechaPredicha.getMonth() + this.intervaloTeorico);
      return {
        fecha: fechaPredicha,
        confianza: 0.7,
        metodo: 'intervalo teórico (sin historial)'
      };
    }

    // Calcular intervalos reales entre mantenimientos
    const intervalosReales = [];
    for (let i = 1; i < this.mantenimientos.length; i++) {
      const diff = (this.mantenimientos[i].fecha - this.mantenimientos[i-1].fecha) / (1000 * 60 * 60 * 24 * 30.44);
      intervalosReales.push(diff);
    }

    // Si solo hay un mantenimiento, usar promedio entre teórico y real
    if (intervalosReales.length === 0) {
      const ultimoMantenimiento = this.mantenimientos[0].fecha;
      const intervaloReal = (ultimoMantenimiento - this.fechaInicioUso) / (1000 * 60 * 60 * 24 * 30.44);
      
      const intervaloPromedio = (intervaloReal + this.intervaloTeorico) / 2;
      
      const fechaPredicha = new Date(ultimoMantenimiento);
      fechaPredicha.setMonth(fechaPredicha.getMonth() + intervaloPromedio);
      
      return {
        fecha: fechaPredicha,
        confianza: 0.75,
        metodo: 'promedio entre primer intervalo real y teórico'
      };
    }

    // Calcular media y desviación estándar de intervalos reales
    const media = intervalosReales.reduce((a, b) => a + b, 0) / intervalosReales.length;
    const desviacion = Math.sqrt(
      intervalosReales.map(x => Math.pow(x - media, 2)).reduce((a, b) => a + b, 0) / intervalosReales.length
    );

    // Factor de ajuste basado en la consistencia de los intervalos
    const factorConsistencia = Math.max(0.5, 1 - (desviacion / media));
    
    // Ponderación entre intervalo real y teórico (dependiendo de la consistencia)
    const intervaloPredicho = (media * factorConsistencia) + 
                             (this.intervaloTeorico * (1 - factorConsistencia));

    // Calcular fecha predicha
    const ultimoMantenimiento = this.mantenimientos[this.mantenimientos.length - 1].fecha;
    const fechaPredicha = new Date(ultimoMantenimiento);
    fechaPredicha.setMonth(fechaPredicha.getMonth() + intervaloPredicho);

    return {
      fecha: fechaPredicha,
      confianza: Math.min(0.95, 0.7 + (factorConsistencia * 0.3)), // Confianza entre 70% y 95%
      metodo: 'modelo adaptativo con historial',
      intervaloPredicho,
      mediaReal: media,
      desviacionReal: desviacion,
      factorConsistencia
    };
  }
}

module.exports = Equipo;