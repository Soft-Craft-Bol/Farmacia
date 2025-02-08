const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
require('dotenv').config();


exports.register = async (req, res) => {
    const { nombre, apellido, usuario, email, password, ci, profesion, foto, areaId, roleIds } = req.body;
    
    try {
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const roles = await prisma.role.findMany({
            where: {
                id: { in: roleIds },
            }
        });
        
        if (roles.length !== roleIds.length) {
            return res.status(400).json({ error: 'Uno o más roles no existen' });
        }

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
exports.getProfile = async (req, res) => {
    try {
  
      const userId = req.user.id;
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: { include: { role: true } },
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
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
        area: user.areaId, 
        roles: user.roles.map(r => r.role.nombre),
      };
  
      return res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching profile' });
    }
  };

exports.login = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    
    try {
        // Buscar el usuario en la base de datos
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                roles: { include: { role: true } },  // Incluir roles
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        // Generar el token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Obtener el nombre completo (nombre + apellido) y el rol del usuario
        const fullName = `${user.nombre} ${user.apellido}`;
        const roles = user.roles.map(userRole => userRole.role.nombre);
        const photo = user.foto;

        // Responder con los datos del usuario
        res.json({
            token,
            usuario: user.usuario,
            nombreCompleto: fullName,
            roles: roles,  // Roles asociados al usuario
            foto: photo    // Foto del usuario
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al procesar la solicitud' });
    }
};
