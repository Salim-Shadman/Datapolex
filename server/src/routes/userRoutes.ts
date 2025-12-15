import express from 'express';
import { getUsers, getUserProfile, updateUserProfile, createUser } from '../controllers/userController'; // createUser import added
import { protect, admin } from '../middleware/authMiddleware'; // admin middleware needed

const router = express.Router();

router.route('/')
    .get(protect, getUsers)
    .post(protect, admin, createUser); // FIX: POST route added for Admin to add members

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;