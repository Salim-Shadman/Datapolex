import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Sprint from '../models/Sprint';

// @desc    Create a sprint (Auto increments sprint number per project)
// @route   POST /api/sprints
export const createSprint = async (req: Request, res: Response) => {
  try {
    const { projectId, title, startDate, endDate } = req.body;

    // Convert string ID to ObjectId explicitly
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Find the last sprint for this project
    const lastSprint = await Sprint.findOne({ project: projectObjectId })
      .sort({ sprintNumber: -1 })
      .limit(1);

    const sprintNumber = lastSprint ? lastSprint.sprintNumber + 1 : 1;

    const sprint = await Sprint.create({
      title,
      sprintNumber,
      startDate,
      endDate,
      project: projectObjectId,
    });

    res.status(201).json(sprint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sprints by project
// @route   GET /api/sprints/:projectId
export const getSprintsByProject = async (req: Request, res: Response) => {
  try {
    const projectId = new mongoose.Types.ObjectId(req.params.projectId);
    
    // Explicit query without type casting
    const sprints = await Sprint.find({ project: projectId }).sort({ sprintNumber: 1 });
    res.json(sprints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
export const updateSprint = async (req: Request, res: Response) => {
  try {
    const updatedSprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(updatedSprint) res.json(updatedSprint);
    else res.status(404).json({message: 'Sprint not found'});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
export const deleteSprint = async (req: Request, res: Response) => {
    try {
      const sprint = await Sprint.findById(req.params.id);
      if (sprint) {
        await sprint.deleteOne();
        res.json({ message: 'Sprint removed' });
      } else {
        res.status(404).json({ message: 'Sprint not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };