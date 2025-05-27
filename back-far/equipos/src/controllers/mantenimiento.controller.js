const prisma = require('../config/prisma');
const { calcularProximoMantenimiento, calcularDiasRestantes } = require('../utils/dateUtils');


const registrarMantenimiento = async (req, res) => {
    try {
        const {
            equipoId,
            fechaInicio,
            fechaFin,
            tipo,
            descripcion,
            horasUso,
            tecnicoId,
            tecnicoNombre
        } = req.body;

        const nuevoHistorial = await prisma.historialMantenimiento.create({
            data: {
                equipoId,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                tipo,
                descripcion,
                horasUso,
                tecnicoId,
                tecnicoNombre,
            },
        });

        // Actualizar equipo
        await prisma.equipo.update({
            where: { id: equipoId },
            data: {
                ultimoMantenimiento: new Date(fechaFin),
                horasUsoAcumuladas: horasUso,
            },
        });

        res.status(201).json({ message: 'Mantenimiento registrado correctamente', historial: nuevoHistorial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar mantenimiento' });
    }
};


const obtenerEquiposConMantenimiento = async (req, res) => {
    try {
        // Obtener solo los campos necesarios para el cronograma
        const equipos = await prisma.equipo.findMany({
            select: {
                id: true,
                etiquetaActivo: true,
                ubicacion: true,
                tipoMantenimiento: true,
                fechaInicioUso: true,
                fechaCompra: true,
                periodoMantenimiento: true,
                proximoMantenimiento: true,
                historialMantenimientos: {
                    orderBy: { fechaFin: 'desc' },
                    take: 1,
                    select: { fechaFin: true }
                }
            }
        });

        // Procesar los equipos para el cronograma
        const equiposParaCronograma = equipos.map(equipo => {
            // Determinar la fecha de referencia para el cálculo
            let fechaReferencia = null;

            // Prioridad 1: Último mantenimiento registrado
            if (equipo.historialMantenimientos[0]?.fechaFin) {
                fechaReferencia = equipo.historialMantenimientos[0].fechaFin;
            }
            // Prioridad 2: Fecha de inicio de uso
            else if (equipo.fechaInicioUso) {
                fechaReferencia = equipo.fechaInicioUso;
            }
            // Prioridad 3: Fecha de compra (como último recurso)
            else if (equipo.fechaCompra) {
                fechaReferencia = equipo.fechaCompra;
            }
            let proximoMantenimiento = equipo.proximoMantenimiento;
            const periodo = Math.min(equipo.periodoMantenimiento || 6, 60); // Default: 6 meses, máximo 5 años

            if (!proximoMantenimiento && fechaReferencia && periodo) {
                proximoMantenimiento = calcularProximoMantenimiento(fechaReferencia, periodo);

                // Opcional: No permitir fechas demasiado futuras
                const maxDate = new Date();
                maxDate.setFullYear(maxDate.getFullYear() + 5);
                if (proximoMantenimiento > maxDate) {
                    proximoMantenimiento = maxDate;
                }
            }
            // Calcular si necesita mantenimiento
            const diasRestantes = proximoMantenimiento
                ? calcularDiasRestantes(proximoMantenimiento)
                : null;

            return {
                id: equipo.id,
                etiquetaActivo: equipo.etiquetaActivo,
                ubicacion: equipo.ubicacion,
                tipoMantenimiento: equipo.tipoMantenimiento,
                fechaInicioUso: equipo.fechaInicioUso,
                proximoMantenimiento,
                necesitaMantenimiento: diasRestantes !== null && diasRestantes <= 30,
                diasRestantes
            };
        });

        res.status(200).json(equiposParaCronograma);
    } catch (error) {
        console.error("Error al obtener equipos para cronograma:", error);
        res.status(500).json({
            error: "Error al obtener equipos",
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para actualizar fechas de mantenimiento
const actualizarMantenimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicioUso, periodoMantenimiento } = req.body;

        // Validar que el período sea positivo si se proporciona
        if (periodoMantenimiento && periodoMantenimiento <= 0) {
            return res.status(400).json({ error: "El período debe ser mayor a 0" });
        }

        // Obtener equipo actual para referencias
        const equipo = await prisma.equipo.findUnique({
            where: { id: parseInt(id) },
            include: {
                historialMantenimientos: {
                    orderBy: { fechaFin: 'desc' },
                    take: 1
                }
            }
        });

        if (!equipo) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }

        // Calcular próximo mantenimiento
        let proximoMantenimiento = null;
        if (fechaInicioUso || equipo.fechaInicioUso || equipo.fechaCompra) {
            const fechaBase = fechaInicioUso || equipo.fechaInicioUso || equipo.fechaCompra;
            const periodo = periodoMantenimiento || equipo.periodoMantenimiento || 6;
            const fechaReferencia = equipo.historialMantenimientos[0]?.fechaFin || fechaBase;
            proximoMantenimiento = calcularProximoMantenimiento(fechaReferencia, periodo);
        }

        // Actualizar el equipo
        const equipoActualizado = await prisma.equipo.update({
            where: { id: parseInt(id) },
            data: {
                fechaInicioUso: fechaInicioUso ? new Date(fechaInicioUso) : equipo.fechaInicioUso,
                periodoMantenimiento: periodoMantenimiento ? parseInt(periodoMantenimiento) : equipo.periodoMantenimiento,
                proximoMantenimiento
            },
            include: {
                componentes: true,
                imagenes: true,
                documentos: true
            }
        });

        res.status(200).json(equipoActualizado);
    } catch (error) {
        console.error("Error al actualizar mantenimiento:", error);
        res.status(500).json({
            error: "Error al actualizar mantenimiento",
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    obtenerEquiposConMantenimiento,
    actualizarMantenimiento,
    registrarMantenimiento
};