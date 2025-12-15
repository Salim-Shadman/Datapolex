import express from 'express';
import { 
    getUsers, 
    getUserProfile, 
    updateUserProfile, 
    createUser, 
    deleteUser, 
    updateUser 
} from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getUsers)
    .post(protect, admin, createUser);

// Admin routes to manage specific users
router.route('/:id')
    .delete(protect, admin, deleteUser) // FIX: Add Delete Route
    .put(protect, admin, updateUser);   // FIX: Add Update Route

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;