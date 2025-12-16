import { Request, Response } from 'express';
import Sprint from '../models/Sprint';
import Task from '../models/Task'; 
import asyncHandler from '../middleware/asyncHandler';

// @desc    Get all sprints (Filter by Project ID)
export const getSprints = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.query;

  if (!projectId) {
     res.status(400);
     throw new Error('Project ID is required');
  }

  // Sort by sprintNumber to show correct order
  const sprints = await Sprint.find({ project: projectId } as any)
    .sort({ sprintNumber: 1 });

  res.json(sprints);
});

// @desc    Create a sprint (Auto-Increment Logic Added)
export const createSprint = asyncHandler(async (req: Request, res: Response) => {
  const { title, goal, startDate, endDate, project } = req.body;

  // FIX: Auto-increment Sprint Number
  // Find the latest sprint for this project
  const lastSprint = await Sprint.findOne({ project } as any).sort({ sprintNumber: -1 });
  // If lastSprint exists, increment. Else start at 1.
  const sprintNumber = lastSprint ? (lastSprint.sprintNumber || 0) + 1 : 1;

  const sprint = await Sprint.create({
    title,
    goal,
    sprintNumber,
    startDate,
    endDate,
    project,
    status: 'planned' 
  });

  res.status(201).json(sprint);
});

// @desc    Update sprint
export const updateSprint = asyncHandler(async (req: Request, res: Response) => {
  const sprint = await Sprint.findById(req.params.id);

  if (sprint) {
    sprint.title = req.body.title || sprint.title;
    sprint.goal = req.body.goal || sprint.goal;
    sprint.startDate = req.body.startDate || sprint.startDate;
    sprint.endDate = req.body.endDate || sprint.endDate;
    sprint.status = req.body.status || sprint.status;
    // sprintNumber should not be updated manually to preserve order

    const updatedSprint = await sprint.save();
    res.json(updatedSprint);
  } else {
    res.status(404);
    throw new Error('Sprint not found');
  }
});

// @desc    Delete sprint
export const deleteSprint = asyncHandler(async (req: Request, res: Response) => {
  const sprint = await Sprint.findById(req.params.id);

  if (sprint) {
    // Tasks moved to backlog (sprint = null)
    await Task.updateMany(
        { sprint: sprint._id } as any,
        { $set: { sprint: null } }
    );

    await sprint.deleteOne();
    res.json({ message: 'Sprint removed and tasks moved to backlog' });
  } else {
    res.status(404);
    throw new Error('Sprint not found');
  }
});