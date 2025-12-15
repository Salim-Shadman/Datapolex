import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/:id', protect, authorize('admin'), updateUser); // Only admin can update roles
router.delete('/:id', protect, authorize('admin'), deleteUser); // Only admin can delete users

export default router;