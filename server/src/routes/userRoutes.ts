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

// FIX: Delete & Update Route added
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;