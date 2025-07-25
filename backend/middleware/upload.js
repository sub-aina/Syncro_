import multer from "multer";
import path from "path";
import fs from 'fs';
// import path from 'path';

const uploadDir = path.join('uploads', 'resources');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// where to store
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/resources/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });
export default upload;
