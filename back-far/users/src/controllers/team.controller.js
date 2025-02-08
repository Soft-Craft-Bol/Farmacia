const { validationResult } = require('express-validator');
const prisma = require('../config/prisma');

// Crear un nuevo equipo
const createTeam = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await prisma.team.create({
      data: {
        nombre,
        descripcion,
      },
    });

    return res.status(201).json(team);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creando el equipo' });
  }
};

const addUsersToTeam = async (req, res) => {
  try {
    const { teamId, userIds } = req.body;

    // Validar si teamId y userIds fueron proporcionados
    if (!teamId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Faltan los datos requeridos' });
    }

    // Asegurarse de que los usuarios existen y agregar a los usuarios al equipo
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { usuarios: true },
    });

    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    // Asignar los usuarios al equipo
    const userTeamPromises = userIds.map((userId) =>
      prisma.userTeam.create({
        data: {
          teamId,
          userId,
        },
      })
    );

    await Promise.all(userTeamPromises);

    return res.status(200).json({ message: 'Usuarios agregados al equipo exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al agregar usuarios al equipo' });
  }
};

// Obtener equipos con sus usuarios
const getTeamsWithUsers = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        usuarios: {
          include: {
            user: true, // Incluir los datos del usuario
          },
        },
      },
    });

    return res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener equipos' });
  }
};

// Eliminar un usuario de un equipo
const removeUserFromTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Verificar si el equipo y usuario existen
    const userTeam = await prisma.userTeam.findUnique({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(404).json({ message: 'Usuario no encontrado en este equipo' });
    }

    // Eliminar al usuario del equipo
    await prisma.userTeam.delete({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId,
        },
      },
    });

    return res.status(200).json({ message: 'Usuario eliminado del equipo exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar el usuario del equipo' });
  }
};

module.exports = {
  createTeam,
  addUsersToTeam,
  getTeamsWithUsers,
  removeUserFromTeam,
};
