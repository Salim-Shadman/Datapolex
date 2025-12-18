import express from 'express';
import { 
    getSprints, 
    createSprint, 
    updateSprint, 
    deleteSprint 
} from '../controllers/sprintController';
import { protect, adminOrManager } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getSprints)
    .post(protect, adminOrManager, createSprint);

router.route('/:id')
    .put(protect, adminOrManager, updateSprint)
    .delete(protect, adminOrManager, deleteSprint);

export default router;