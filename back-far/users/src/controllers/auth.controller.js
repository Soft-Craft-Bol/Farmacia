const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
require('dotenv').config();


exports.register = async (req, res) => {
    const { nombre, apellido, usuario, email, password, ci, profesion, foto, areaId, roleIds } = req.body;
    
    try {
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                nombre,
                apellido,
                usuario,
                email,
                password: hashedPassword,
                ci,
                profesion,
                foto,
                areaId,
                roles: {
                    create: roleIds.map(roleId => ({
                        role: { connect: { id: roleId } }
                    }))
                }
            },
            include: {
                roles: { include: { role: true } }
            }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};