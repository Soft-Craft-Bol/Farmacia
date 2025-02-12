const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConf');
require('dotenv').config();

// Configurar el almacenamiento de multer para Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'usuariosFarmacia', 
      allowed_formats: ["jpg", "png", "avif", "webp"], 
      public_id: (req, file) => `${Date.now()}-${file.originalname}`, 
    },
});
  
const upload = multer({ storage });

// Registrar nuevo usuario
exports.register = async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, password, ci, profesion, areaId, role, foto } = req.body;
        
        let fotoUrl = foto || null; // Si se envía la URL en JSON, se usa directamente.

        // Si el usuario subió un archivo, subirlo a Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            fotoUrl = result.secure_url; // Ahora tenemos la URL real de Cloudinary
        }

        // Si no hay URL ni archivo, error
        if (!fotoUrl) {
            return res.status(400).json({ error: "La foto es requerida" });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Verificar si el rol existe
        const roleExists = await prisma.role.findUnique({
            where: { id: Number(role) }
        });

        if (!roleExists) {
            return res.status(400).json({ error: 'El rol no existe' });
        }

        // Crear usuario en la base de datos
        const user = await prisma.user.create({
            data: {
                nombre,
                apellido,
                usuario,
                email,
                password: hashedPassword,
                ci,
                profesion,
                foto: fotoUrl, // Ahora guarda la URL correctamente
                areaId: Number(areaId),
                roles: {
                    create: [{ role: { connect: { id: Number(role) } } }]
                }
            },
            include: {
                roles: { include: { role: true } }
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error("🔥 ERROR en register():", error);
        res.status(400).json({ error: error.message });
    }
};



// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
  
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                area: true,
                roles: { include: { role: true } },
            },
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
            nombre: user.area ? user.area.nombre : null,
            roles: user.roles.map(r => r.role.nombre),
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
