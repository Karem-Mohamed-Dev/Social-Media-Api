const multer = require("multer");
const { errorModel } = require("./errorModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dq1hhuawl",
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/'))
        cb(null, true);
    else
        cb(errorModel(400, "File type not supported"));

}

const limits = { fileSize: 1024 * 1024 * 2 }

const upload = multer({ storage, fileFilter, limits });

module.exports = { cloudinary, upload }