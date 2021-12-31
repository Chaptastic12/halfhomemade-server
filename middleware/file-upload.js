const multer = require('multer');
const { v4: uuid }   = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
}

const fileUpload = multer({
    limits: 2500000,
    storage: multer.diskStorage({
        destination: ( req, file, callback ) => {
            callback(null, 'uploads/images');
        },
        filename: ( req, file, callback ) => {
            const fileExtension = MIME_TYPE_MAP[file.mimetype];
            fileName = uuid() + '.' + fileExtension
            callback(null, fileName);
        }
    }),
    fileFilter: ( req, file, callback ) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : 'Invalid mimetype';
        callback(error, isValid);
    }
});

module.exports = fileUpload;