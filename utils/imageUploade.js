const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, uuidv4() + file.originalname);
    }
})
// const filter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/'))
//         cb(null, true);
//     else
//         cb(new Error('Please upload only images.'), false);

// }

module.exports = multer({ storage });