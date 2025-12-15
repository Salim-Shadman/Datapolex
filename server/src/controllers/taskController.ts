import { Request, Response } from 'express';
import Task from '../models/Task';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, sprintId, assigneeId, status, priority } = req.query;
  let query: any = {};

  if (projectId) query.project = projectId;
  if (sprintId) query.sprint = sprintId;
  if (assigneeId) query.assignees = assigneeId;
  if (status) query.status = { $in: (status as string).split(',') };
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('assignees', 'name email')
    .populate('sprint', 'title sprintNumber')
    .populate('comments.user', 'name')
    .populate('timeLogs.user', 'name');
    
  res.json(tasks);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const userRole = req.user.role;
  const userId = req.user._id;

  const originalTask = await Task.findById(req.params.id);
  if (!originalTask) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (userRole === 'member' && status === 'done') {
      res.status(403);
      throw new Error('Approval Required: Members can only move tasks to "Review".');
  }

  let updateData = { ...req.body };

  if (status && status !== originalTask.status) {
      updateData.$push = { 
          comments: {
              user: userId,
              text: `Changed status from "${originalTask.status}" to "${status}"`,
              createdAt: new Date()
          } 
      };
  }

  const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .populate('assignees', 'name email')
    .populate('comments.user', 'name'); 
  
  res.json(task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (task) { 
    await task.deleteOne(); 
    res.json({ message: 'Task removed' }); 
  } else { 
    res.status(404);
    throw new Error('Task not found');
  }
});

export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    task.comments.push({ 
      user: req.user._id, 
      text: req.body.text, 
      createdAt: new Date() 
    });
    await task.save();
    const updatedTask = await Task.findById(req.params.id)
      .populate('assignees')
      .populate('comments.user', 'name');
    res.status(201).json(updatedTask);
  } else { 
    res.status(404);
    throw new Error('Task not found');
  }
});

export const logTime = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { hours } = req.body;
  const task = await Task.findById(req.params.id);
  if(task) {
      task.timeLogs.push({ 
          user: req.user._id, 
          hours: Number(hours), 
          date: new Date() 
      });
      task.actualHours = (task.actualHours || 0) + Number(hours);
      await task.save();
      const updatedTask = await Task.findById(req.params.id).populate('timeLogs.user', 'name');
      res.status(201).json(updatedTask);
  } else { 
    res.status(404);
    throw new Error('Task not found');
  }
});