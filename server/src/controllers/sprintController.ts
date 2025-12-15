import { Request, Response } from 'express';
import Sprint from '../models/Sprint';
import Task from '../models/Task'; 
import asyncHandler from '../middleware/asyncHandler';

// @desc    Get all sprints (Filter by Project ID)
// @route   GET /api/sprints
export const getSprints = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.query;

  if (!projectId) {
     res.status(400);
     throw new Error('Project ID is required');
  }

  // FIX: 'as any' ব্যবহার করা হয়েছে টাইপ কনফ্লিক্ট এড়াতে
  const sprints = await Sprint.find({ project: projectId } as any)
    .sort({ startDate: 1 });

  res.json(sprints);
});

// @desc    Create a sprint
// @route   POST /api/sprints
export const createSprint = asyncHandler(async (req: Request, res: Response) => {
  const { title, goal, startDate, endDate, project } = req.body;

  // FIX: এখানেও 'as any' দেওয়া হলো সেইফটির জন্য
  const sprintExists = await Sprint.findOne({ title, project } as any);
  if (sprintExists) {
    res.status(400);
    throw new Error('Sprint already exists in this project');
  }

  const sprint = await Sprint.create({
    title,
    goal,
    startDate,
    endDate,
    project,
    status: 'planned' 
  });

  res.status(201).json(sprint);
});

// @desc    Update sprint
// @route   PUT /api/sprints/:id
export const updateSprint = asyncHandler(async (req: Request, res: Response) => {
  const sprint = await Sprint.findById(req.params.id);

  if (sprint) {
    sprint.title = req.body.title || sprint.title;
    sprint.goal = req.body.goal || sprint.goal;
    sprint.startDate = req.body.startDate || sprint.startDate;
    sprint.endDate = req.body.endDate || sprint.endDate;
    sprint.status = req.body.status || sprint.status;

    const updatedSprint = await sprint.save();
    res.json(updatedSprint);
  } else {
    res.status(404);
    throw new Error('Sprint not found');
  }
});

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
export const deleteSprint = asyncHandler(async (req: Request, res: Response) => {
  const sprint = await Sprint.findById(req.params.id);

  if (sprint) {
    // FIX: টাস্ক আপডেটের সময়ও 'as any' ব্যবহার করা হলো
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