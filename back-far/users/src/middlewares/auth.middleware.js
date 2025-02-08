const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    console.log("Token recibido en backend:", token);

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
    }

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
        return res.status(400).json({ error: 'Token no válido o expirado' });
    }
};


module.exports = verifyToken;
