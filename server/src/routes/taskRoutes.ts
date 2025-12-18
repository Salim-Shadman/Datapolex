import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, addComment, logTime, toggleTimer } from '../controllers/taskController';
import { protect, adminOrManager } from '../middleware/authMiddleware'; 

const router = express.Router();

router.route('/')
  
  .post(protect, adminOrManager, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, updateTask)
  
  .delete(protect, adminOrManager, deleteTask);

router.post('/:id/comments', protect, addComment);
router.post('/:id/log-time', protect, logTime);
router.post('/:id/timer', protect, toggleTimer);

export default router;