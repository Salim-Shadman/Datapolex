import express from 'express';
import { createSprint, getSprintsByProject, updateSprint, deleteSprint } from '../controllers/sprintController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager'), createSprint);
router.get('/:projectId', protect, getSprintsByProject);
router.put('/:id', protect, authorize('admin', 'manager'), updateSprint);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteSprint);

export default router;