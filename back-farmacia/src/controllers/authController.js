const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UsuarioRoles = require('../models/UsuarioRoles'); // Modelo para la tabla relacional
require('dotenv').config();

// Registro de usuario
exports.registerUser = async (req, res) => {
    const { nombre, apellido, profesion, fecha_nac, usuario, password, rol_id } = req.body;

    try {
        // Verificar que se proporcione un rol válido
        if (!rol_id) {
            return res.status(400).json({ message: 'Se debe proporcionar un rol válido' });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario
        const newUser = await User.create({
            nombre,
            apellido,
            profesion,
            fecha_nac,
            usuario,
            password: hashedPassword,
        });

        // Asociar el usuario al rol en la tabla usuario_roles
        await UsuarioRoles.create({
            usuario_id: newUser.id,
            rol_id, // Directamente relacionamos el ID proporcionado
        });

        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando usuario', error });
    }
};

// Login de usuario (sin cambios)
exports.loginUser = async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Buscar al usuario
        const user = await User.findOne({ where: { usuario } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Comparar contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'clave_secreta',
            { expiresIn: '1h' }
        );

        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: 'Error durante el inicio de sesión', error });
    }
};
