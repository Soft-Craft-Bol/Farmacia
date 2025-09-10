const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los roles con sus permisos
const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: { 
                permisos: { 
                    include: { 
                        permission: true 
                    } 
                },
                usuarios: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(roles);
    } catch (error) {
        console.error("Error al obtener roles:", error);
        res.status(500).json({ error: "Error al obtener roles" });
    }
};

// Obtener todos los permisos disponibles
const getPermissions = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
        res.json(permissions);
    } catch (error) {
        console.error("Error al obtener permisos:", error);
        res.status(500).json({ error: "Error al obtener permisos" });
    }
};

// Crear un nuevo rol con permisos
const createRole = async (req, res) => {
    const { nombre, descripcion, permisos } = req.body;
    
    try {
        if (!nombre || !permisos || !Array.isArray(permisos)) {
            return res.status(400).json({ 
                error: "Nombre y permisos son requeridos, y permisos debe ser un array" 
            });
        }

        // Verificar si el rol ya existe
        const rolExistente = await prisma.role.findUnique({
            where: { nombre }
        });

        if (rolExistente) {
            return res.status(400).json({ error: "Ya existe un rol con este nombre" });
        }

        // Verificar que los permisos existen
        const permisosExistentes = await prisma.permission.findMany({
            where: { id: { in: permisos.map(p => parseInt(p)) } }
        });

        if (permisosExistentes.length !== permisos.length) {
            return res.status(400).json({ error: "Uno o más permisos no existen" });
        }

        const nuevoRol = await prisma.role.create({
            data: {
                nombre,
                permisos: {
                    create: permisos.map(id => ({
                        permission: { connect: { id: parseInt(id) } }
                    }))
                }
            },
            include: {
                permisos: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        res.status(201).json(nuevoRol);
    } catch (error) {
        console.error("Error al crear rol:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Asignar rol a usuario
const assignRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body;
    
    try {
        // Convertir los IDs a números enteros
        const userIdInt = parseInt(userId, 10);
        const roleIdInt = parseInt(roleId, 10);

        // Verificar que las conversiones fueron exitosas
        if (isNaN(userIdInt)) {
            return res.status(400).json({ error: "El ID de usuario debe ser un número válido" });
        }
        if (isNaN(roleIdInt)) {
            return res.status(400).json({ error: "El ID de rol debe ser un número válido" });
        }

        // Verificar que el usuario y el rol existen
        const [user, role] = await Promise.all([
            prisma.user.findUnique({ where: { id: userIdInt } }),
            prisma.role.findUnique({ where: { id: roleIdInt } })
        ]);

        if (!user || !role) {
            return res.status(404).json({ error: "Usuario o rol no encontrado" });
        }

        // Resto de tu lógica...
        const assignment = await prisma.userRole.create({
            data: { 
                userId: userIdInt, 
                roleId: roleIdInt 
            },
            include: {
                user: true,
                role: true
            }
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error("Error al asignar rol:", error);
        res.status(500).json({ error: "Error al asignar el rol" });
    }
};

// Eliminar un rol
const deleteRole = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar si el rol está asignado a algún usuario
        const usersWithRole = await prisma.userRole.findMany({
            where: { roleId: parseInt(id) }
        });

        if (usersWithRole.length > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el rol porque está asignado a usuarios" 
            });
        }

        // Primero eliminar las relaciones con permisos
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // Luego eliminar el rol
        await prisma.role.delete({ 
            where: { id: parseInt(id) } 
        });

        res.json({ message: "Rol eliminado correctamente." });
    } catch (error) {
        console.error("Error al eliminar el rol:", error);
        res.status(500).json({ error: "Error al eliminar el rol" });
    }
};

// Actualizar un rol (nuevo)
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;
    
    try {
        // Verificar que el rol existe
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) }
        });

        if (!role) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }

        // Verificar que los nuevos permisos existen
        if (permisos && Array.isArray(permisos)) {
            const permisosExistentes = await prisma.permission.findMany({
                where: { id: { in: permisos.map(p => parseInt(p)) } }
            });

            if (permisosExistentes.length !== permisos.length) {
                return res.status(400).json({ error: "Uno o más permisos no existen" });
            }
        }

        // Actualizar el rol
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                nombre: nombre || role.nombre,
                descripcion: descripcion !== undefined ? descripcion : role.descripcion,
                ...(permisos && Array.isArray(permisos) ? {
                    permisos: {
                        deleteMany: {}, // Eliminar todos los permisos actuales
                        create: permisos.map(permisoId => ({
                            permission: { connect: { id: parseInt(permisoId) } }
                        }))
                    }
                } : {})
            },
            include: {
                permisos: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        res.json(updatedRole);
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ error: "Error al actualizar el rol" });
    }
};

// Crear un nuevo permiso (nuevo)
const createPermission = async (req, res) => {
    const { nombre, descripcion } = req.body;
    
    try {
        if (!nombre) {
            return res.status(400).json({ error: "El nombre del permiso es requerido" });
        }

        // Verificar si el permiso ya existe
        const permisoExistente = await prisma.permission.findUnique({
            where: { nombre }
        });

        if (permisoExistente) {
            return res.status(400).json({ error: "Ya existe un permiso con este nombre" });
        }

        const nuevoPermiso = await prisma.permission.create({
            data: {
                nombre,
            }
        });

        res.status(201).json(nuevoPermiso);
    } catch (error) {
        console.error("Error al crear permiso:", error);
        res.status(500).json({ error: "Error al crear permiso" });
    }
};

// Eliminar un permiso (nuevo)
const deletePermission = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar si el permiso está asignado a algún rol
        const rolesConPermiso = await prisma.rolePermission.findMany({
            where: { permissionId: parseInt(id) }
        });

        if (rolesConPermiso.length > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el permiso porque está asignado a roles" 
            });
        }

        await prisma.permission.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Permiso eliminado correctamente." });
    } catch (error) {
        console.error("Error al eliminar permiso:", error);
        res.status(500).json({ error: "Error al eliminar el permiso" });
    }
};

// Obtener usuarios por rol (nuevo)
const getUsersByRole = async (req, res) => {
    const { roleId } = req.params;
    
    try {
        const users = await prisma.userRole.findMany({
            where: { roleId: parseInt(roleId) },
            include: {
                user: true,
                role: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios por rol:", error);
        res.status(500).json({ error: "Error al obtener usuarios por rol" });
    }
};

// Quitar rol a usuario (nuevo)
const removeRoleFromUser = async (req, res) => {
    const { userId, roleId } = req.body;
    
    try {
        // Verificar que la asignación existe
        const assignment = await prisma.userRole.findFirst({
            where: { userId, roleId }
        });

        if (!assignment) {
            return res.status(404).json({ error: "El usuario no tiene asignado este rol" });
        }

        await prisma.userRole.delete({
            where: { id: assignment.id }
        });

        res.json({ message: "Rol removido correctamente del usuario" });
    } catch (error) {
        console.error("Error al remover rol:", error);
        res.status(500).json({ error: "Error al remover el rol del usuario" });
    }
};

module.exports = {
    getRoles,
    getPermissions,
    createRole,
    assignRoleToUser,
    deleteRole,
    updateRole,
    createPermission,
    deletePermission,
    getUsersByRole,
    removeRoleFromUser
};