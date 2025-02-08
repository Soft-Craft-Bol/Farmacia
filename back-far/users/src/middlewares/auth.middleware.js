const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Extraer solo el token

    if (!token) return res.status(401).json({ error: "Acceso denegado, token no proporcionado" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("Error en verificación del token:", err);
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

module.exports = verifyToken;
