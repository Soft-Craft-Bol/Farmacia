const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
<<<<<<< HEAD
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Extraer solo el token

    if (!token) return res.status(401).json({ error: "Acceso denegado, token no proporcionado" });
=======
    const token = req.header('Authorization');
    console.log("Token recibido en backend:", token);

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
    }
>>>>>>> c7ba027134ab5f95585a9ad480c3a4d963faee8b

    try {
        const tokenParts = token.split(' ');  
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(400).json({ error: 'Token no válido' });
        }

        const verified = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
        console.log("Usuario verificado:", verified);
        
        req.user = verified;
        next();
    } catch (err) {
<<<<<<< HEAD
        console.error("Error en verificación del token:", err);
        res.status(401).json({ error: "Token inválido o expirado" });
=======
        return res.status(400).json({ error: 'Token no válido o expirado' });
>>>>>>> c7ba027134ab5f95585a9ad480c3a4d963faee8b
    }
};


module.exports = verifyToken;
