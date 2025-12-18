import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { protect, adminOrManager } from '../middleware/authMiddleware'; 

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOrManager, createProject); 

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOrManager, updateProject) 
  .delete(protect, adminOrManager, deleteProject); 

export default router;