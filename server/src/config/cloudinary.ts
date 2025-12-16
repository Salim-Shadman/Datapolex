import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mpms_uploads', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx'], // FIX: Restricted formats
    resource_type: 'auto',
  } as any,
});

// FIX: Added File Filter & Size Limit (Max 5MB)
export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs and Word docs are allowed!'));
        }
    }
});