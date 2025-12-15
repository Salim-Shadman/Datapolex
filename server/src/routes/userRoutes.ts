import express from 'express';
import { getUsers, getUserProfile, updateUserProfile } from '../controllers/userController'; // Import added
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getUsers);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile); // PUT Request যোগ করা হলো

export default router;