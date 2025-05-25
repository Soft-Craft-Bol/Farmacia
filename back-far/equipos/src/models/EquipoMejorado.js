const Equipo = require('./Equipo');

class EquipoMejorado extends Equipo {
  constructor(tipo, fechaAdquisicion, fechaInicioUso, intervaloTeorico = null, condicionesAmbientales = 'normales') {
    super(tipo, fechaAdquisicion, fechaInicioUso, intervaloTeorico);
    this.condicionesAmbientales = condicionesAmbientales; // 'normales', 'adversas', 'controladas'
    this.horasUsoDiarias = 8; // Default 8 horas/día
    this.fallosReportados = 0;
  }

  reportarFallo() {
    this.fallosReportados++;
  }

  predecirProximoMantenimiento() {
    const prediccionBase = super.predecirProximoMantenimiento();
    
    // Ajustar por condiciones ambientales
    let factorAmbiental = 1;
    if (this.condicionesAmbientales === 'adversas') {
      factorAmbiental = 0.7; // Reducir intervalo en 30%
    } else if (this.condicionesAmbientales === 'controladas') {
      factorAmbiental = 1.2; // Aumentar intervalo en 20%
    }

    // Ajustar por horas de uso
    const factorUso = Math.min(1.5, Math.max(0.7, this.horasUsoDiarias / 8));
    
    // Ajustar por fallos reportados
    const factorFallos = Math.max(0.5, 1 - (this.fallosReportados * 0.1));
    
    // Aplicar factores
    const intervaloAjustado = prediccionBase.intervaloPredicho * factorAmbiental * factorUso * factorFallos;
    
    // Calcular nueva fecha
    const ultimoMantenimiento = this.mantenimientos[this.mantenimientos.length - 1].fecha;
    const fechaAjustada = new Date(ultimoMantenimiento);
    fechaAjustada.setMonth(fechaAjustada.getMonth() + intervaloAjustado);

    return {
      ...prediccionBase,
      fecha: fechaAjustada,
      intervaloPredicho: intervaloAjustado,
      confianza: Math.max(0.5, prediccionBase.confianza * 0.9 + (1 / (1 + this.fallosReportados)) * 0.1),
      factores: {
        ambiental: factorAmbiental,
        uso: factorUso,
        fallos: factorFallos
      }
    };
  }
}


module.exports = EquipoMejorado;