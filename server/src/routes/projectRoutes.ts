import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { protect, adminOrManager } from '../middleware/authMiddleware'; // FIX: 'authorize' সরিয়ে 'adminOrManager' আনা হলো

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOrManager, createProject); // শুধু অ্যাডমিন/ম্যানেজার প্রোজেক্ট তৈরি করতে পারবে

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOrManager, updateProject) // শুধু অ্যাডমিন/ম্যানেজার এডিট করতে পারবে
  .delete(protect, adminOrManager, deleteProject); // শুধু অ্যাডমিন/ম্যানেজার ডিলিট করতে পারবে

export default router;