const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join( "images"));
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + file.originalname);
    }
})

module.exports = multer({storage});