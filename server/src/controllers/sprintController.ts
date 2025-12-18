import { Request, Response } from 'express';
import Sprint from '../models/Sprint';
import Task from '../models/Task'; 
import asyncHandler from '../middleware/asyncHandler';


export const getSprints = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.query;

  if (!projectId) {
     res.status(400);
     throw new Error('Project ID is required');
  }

  
  const sprints = await Sprint.find({ project: projectId } as any)
    .sort({ sprintNumber: 1 });

  res.json(sprints);
});


export const createSprint = asyncHandler(async (req: Request, res: Response) => {
  const { title, goal, startDate, endDate, project } = req.body;

 
  const lastSprint = await Sprint.findOne({ project } as any).sort({ sprintNumber: -1 });

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


export const deleteSprint = asyncHandler(async (req: Request, res: Response) => {
  const sprint = await Sprint.findById(req.params.id);

  if (sprint) {
    
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