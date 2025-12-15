import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/projectController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'manager'), createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin', 'manager'), updateProject)
  .delete(protect, authorize('admin', 'manager'), deleteProject);

export default router;