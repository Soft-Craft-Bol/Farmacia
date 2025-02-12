const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRoles = async (req, res) => {
    try {
      const roles = await prisma.role.findMany({
        include: { permisos: { include: { permission: true } } },
      });
      res.json(roles);
    } catch (error) {
      console.error("Error al obtener roles:", error);
      res.status(500).json({ error: "Error al obtener roles" });
    }
};

const getPermissions = async (req, res) => {
    try {
      const permissions = await prisma.permission.findMany();
      res.json(permissions);
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      res.status(500).json({ error: "Error al obtener permisos" });
    }
};

const createRole = async (req, res) => {
    const { nombre, permisos } = req.body;
    try {
        if (!nombre || !permisos || !Array.isArray(permisos)) {
            return res.status(400).json({ error: "Nombre y permisos son requeridos, y permisos debe ser un array" });
        }
        const permisosIds = permisos.map(id => parseInt(id, 10));

        if (permisosIds.some(isNaN)) {
            return res.status(400).json({ error: "Los IDs de permisos deben ser números enteros" });
        }

        const nuevoRol = await prisma.role.create({
            data: {
                nombre,
                permisos: {
                    create: permisosIds.map(id => ({
                        permission: { connect: { id } }
                    }))
                }
            }
        });

        res.json(nuevoRol);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


const assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;
  
    try {
      await prisma.userRole.create({
        data: { userId, roleId },
      });
  
      res.json({ message: "Rol asignado correctamente." });
    } catch (error) {
      console.error("Error al asignar rol:", error);
      res.status(500).json({ error: "Error al asignar el rol" });
    }
};

const deleteRole = async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.role.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Rol eliminado correctamente." });
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      res.status(500).json({ error: "Error al eliminar el rol" });
    }
};

module.exports = {
    getRoles,
    getPermissions,
    createRole,
    assignRoleToUser,
    deleteRole,
};