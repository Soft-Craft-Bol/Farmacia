exports.getUsers = async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
};

exports.getUserById = async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
};

exports.updateUser = async (req, res) => {
    const { nombre, apellido, usuario, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { nombre, apellido, usuario, email }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar usuario' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(400).json({ error: 'Error al eliminar usuario' });
    }
};

exports.getUsersByRole = async (req, res) => {
    const users = await prisma.user.findMany({
        where: { roles: { some: { roleId: parseInt(req.params.roleId) } } },
        include: { roles: true }
    });
    res.json(users);
};