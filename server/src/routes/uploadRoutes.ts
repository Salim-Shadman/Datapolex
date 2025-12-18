import express from 'express';
import { upload } from '../config/cloudinary';

const router = express.Router();


router.post('/', upload.single('file'), (req, res) => {
  if (req.file) {
    
    res.json({ url: req.file.path, filename: req.file.filename });
  } else {
    res.status(400).json({ message: 'File upload failed' });
  }
});

export default router;