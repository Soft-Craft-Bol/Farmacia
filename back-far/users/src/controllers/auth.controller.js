const bcrypt = require('bcrypt');
require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary'); // si usas Cloudinary
const fs = require('fs');


// Configuración del transporter para nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });



exports.register = [
    async (req, res) => {
        console.log("Registro de usuario:", req.body);
        try {
            const { nombre, apellido, usuario, email, password, ci, profesion, roles, areas } = req.body;

            let imagenUrl = null;

            if (req.file) {
                  // Si usas Cloudinary
                  const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'users',
                  });
                  imagenUrl = result.secure_url;
            
                  // Elimina el archivo temporal
                  fs.unlinkSync(req.file.path);
                }
          
            const hashedPassword = await bcrypt.hash(password, 10);

            // Asegura que roles y areas estén como arrays de números
            const parsedRoles = Array.isArray(roles) ? roles.map(Number) : JSON.parse(roles);
            const parsedAreas = Array.isArray(areas) ? areas.map(Number) : JSON.parse(areas);

            // Validación de existencia
            const foundRoles = await prisma.role.findMany({
                where: { id: { in: parsedRoles } }
            });

            const foundAreas = await prisma.area.findMany({
                where: { id: { in: parsedAreas } }
            });

            if (foundRoles.length !== parsedRoles.length) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Uno o más roles no existen' });
            }

            if (foundAreas.length !== parsedAreas.length) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Una o más áreas no existen' });
            }

            const user = await prisma.user.create({
                data: {
                    nombre,
                    apellido,
                    usuario,
                    email,
                    password: hashedPassword,
                    ci,
                    profesion,
                    foto: imagenUrl,
                    roles: {
                        create: parsedRoles.map(roleId => ({
                            role: { connect: { id: roleId } }
                        }))
                    },
                    areas: {
                        create: parsedAreas.map(areaId => ({
                            area: { connect: { id: areaId } }
                        }))
                    }
                },
                include: {
                    roles: { include: { role: true } },
                    areas: { include: { area: true } }
                }
            });

            res.status(201).json(user);
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            console.error("Error en registro:", error);
            res.status(400).json({ error: error.message });
        }
    }
];


// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
    try {
      const userId = parseInt(req.user.id);
      if (isNaN(userId)) {
          return res.status(400).json({ error: 'ID de usuario inválido' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: { include: { role: true } },
            areas: { include: { area: true } }
        }
    });
  
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
  
        const response = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            usuario: user.usuario,
            email: user.email,
            ci: user.ci,
            profesion: user.profesion,
            foto: user.foto,
            roles: user.roles.map(r => r.role.nombre),
            areas: user.areas.map(a => a.area.nombre),
        };
  
        return res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                roles: { include: { role: true } },  // Incluir roles
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        // Generar token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Obtener nombre completo y roles del usuario
        const fullName = `${user.nombre} ${user.apellido}`;
        const roles = user.roles.map(userRole => userRole.role.nombre);
        const photo = user.foto;

        res.json({
            token,
            id: user.id,
            usuario: user.usuario,
            nombreCompleto: fullName,
            roles: roles,
            foto: photo
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al procesar la solicitud' });
    }
};

// Obtener roles disponibles
exports.getRoles = async (req, res) => {
    const roles = await prisma.role.findMany();
    res.json(roles);
};





// Solicitar recuperación de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Buscar usuario por email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de expiración

    // Actualizar usuario con el token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Crear enlace de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configurar correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Por favor, haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <p>El enlace expirará en 1 hora.</p>
      `
    };

    // Enviar correo electrónico
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Se ha enviado un enlace de recuperación a tu correo electrónico' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Buscar usuario por token y verificar expiración
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};