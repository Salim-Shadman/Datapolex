import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, addComment, logTime, toggleTimer } from '../controllers/taskController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager'), createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('admin', 'manager'), deleteTask);

router.post('/:id/comments', protect, addComment);
router.post('/:id/log-time', protect, logTime);
router.post('/:id/timer', protect, toggleTimer); // New Route for Real-time Timer

export default router;