// routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { handleUpload } from '../controllers/uploadController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('Saving file to:', uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Saving to:', uploadDir); // debug log
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.md') {
      cb(null, true);
    } else {
      cb(new Error('Only .md files are allowed'));
    }
  }
});

const router = express.Router();
router.post('/upload', upload.single('file'), handleUpload);

export default router;
