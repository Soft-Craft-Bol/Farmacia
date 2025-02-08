const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Acceso denegado, token no proporcionado o mal formateado" });
    }

    // Extraer el token correctamente
    const token = authHeader.split(" ")[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Usuario verificado:", verified);

        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token no válido o expirado" });
    }
};

module.exports = verifyToken;
