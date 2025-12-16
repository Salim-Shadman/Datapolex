import express from 'express';
import { upload } from '../config/cloudinary';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload file to Cloudinary
router.post('/', upload.single('file'), (req, res) => {
  if (req.file) {
    // Return the secure URL from Cloudinary
    res.json({ url: req.file.path, filename: req.file.filename });
  } else {
    res.status(400).json({ message: 'File upload failed' });
  }
});

export default router;