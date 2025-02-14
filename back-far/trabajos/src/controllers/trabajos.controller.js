const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.createTrabajo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    console.log("  Datos recibidos:", req.body); 

    const nuevoTrabajo = await prisma.trabajo.create({
      data: {
        nombre,
        descripcion,
      },
    });

    return res.status(201).json({
      message: 'Trabajo creado con éxito',
      data: nuevoTrabajo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el trabajo' });
  }
};


exports.addUsersToTrabajo = async (req, res) => {
  const { trabajoId } = req.params;
  const { users } = req.body; 

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({
      error: 'Se requiere un array de usuarios para asignar',
    });
  }

  try {
    const trabajoExists = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) },
    });

    if (!trabajoExists) {
      return res.status(404).json({ error: 'El trabajo no existe' });
    }

    const usuariosAInsertar = users.map((u) => ({
      trabajoId: Number(trabajoId),
      userId: u.userId,
      isAdmin: !!u.isAdmin,
    }));

    
    await prisma.trabajoEquipo.createMany({
      data: usuariosAInsertar,
      skipDuplicates: true, 
    });

    return res.status(200).json({
      message: 'Usuarios asignados correctamente',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al asignar usuarios al trabajo',
    });
  }
};


exports.getTrabajoById = async (req, res) => {
  const { trabajoId } = req.params;
  try {
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: Number(trabajoId) },
      include: {
        equipos: true, 
      },
    });

    if (!trabajo) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }

    
    return res.json(trabajo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al obtener el trabajo',
    });
  }
};


exports.getAllTrabajos = async (req, res) => {
  try {
    const trabajos = await prisma.trabajo.findMany({
      include: {
        equipos: true,
      },
    });
    return res.json(trabajos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al obtener los trabajos',
    });
  }
};


exports.removeUserFromTrabajo = async (req, res) => {
  const { trabajoId, userId } = req.params;

  try {
    await prisma.trabajoEquipo.deleteMany({
      where: {
        trabajoId: Number(trabajoId),
        userId: userId,
      },
    });

    return res.json({
      message: 'Usuario eliminado del trabajo correctamente',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al eliminar usuario del trabajo',
    });
  }
};
