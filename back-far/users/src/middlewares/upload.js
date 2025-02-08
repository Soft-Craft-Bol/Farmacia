const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConf');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'usuariosFarmacia', 
        allowed_formats: ["jpg", "png", "avif", "webp"], 
        public_id: (req, file) => `${Date.now()}-${file.originalname}`, 
    },
});

const upload = multer({ storage });

module.exports = upload;
