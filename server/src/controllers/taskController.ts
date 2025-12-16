import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, project, sprint, assignees, priority, dueDate, status, attachments, estimate } = req.body;

  const projectExists = await Project.findById(project);
  if (!projectExists) {
    res.status(404);
    throw new Error('Project not found');
  }

  const task = await Task.create({
    title,
    description,
    project,
    sprint: sprint || null,
    assignees,
    priority,
    dueDate,
    status: status || 'todo',
    attachments: attachments || [],
    estimate: estimate || 0
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email avatar')
    .populate('sprint', 'title sprintNumber');

  res.status(201).json(populatedTask);
});

// @desc    Get all tasks with Pagination & Filters
// @route   GET /api/tasks
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, sprintId, status, priority, assignee, page, limit } = req.query;

  let query: any = {};
  if (projectId) query.project = projectId;
  if (sprintId) query.sprint = sprintId;
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignees = assignee;

  // Pagination Logic
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 50; // Default to 50 items per load
  const skip = (pageNum - 1) * limitNum;

  const tasks = await Task.find(query)
    .populate('assignees', 'name email avatar')
    .populate('sprint', 'title sprintNumber')
    .populate('comments.user', 'name avatar')
    .populate('timeLogs.user', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(tasks);
});

// @desc    Update task (With Security Check)
// @route   PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    // Security Check: Review to Done requires Manager/Admin
    if (task.status === 'review' && req.body.status === 'done') {
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            res.status(403);
            throw new Error('Permission denied: Only Managers can approve tasks from Review to Done.');
        }
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.estimate = req.body.estimate || task.estimate;
    
    if (req.body.assignees) task.assignees = req.body.assignees;
    if (req.body.sprint !== undefined) task.sprint = req.body.sprint;
    if (req.body.subtasks) task.subtasks = req.body.subtasks;

    const updatedTask = await task.save();
    
    const populatedTask = await Task.findById(updatedTask._id)
        .populate('assignees', 'name email avatar')
        .populate('sprint', 'title sprintNumber')
        .populate('comments.user', 'name avatar')
        .populate('timeLogs.user', 'name');

    res.json(populatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
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

// @desc    Add comment
// @route   POST /api/tasks/:id/comments
export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    const comment = {
      user: req.user._id,
      text: req.body.text,
      createdAt: new Date()
    };
    task.comments.push(comment as any);
    await task.save();
    res.status(201).json({ message: 'Comment added' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Log time
// @route   POST /api/tasks/:id/log-time
export const logTime = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { hours } = req.body;
  const task = await Task.findById(req.params.id);
  if (task) {
    const log = {
      user: req.user._id,
      hours: Number(hours),
      date: new Date()
    };
    task.timeLogs.push(log as any);
    task.actualHours = task.timeLogs.reduce((acc, item) => acc + item.hours, 0);
    await task.save();
    res.json(task);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Toggle Timer
// @route   POST /api/tasks/:id/timer
export const toggleTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  const userId = req.user._id;

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const activeTimerIndex = task.activeTimers.findIndex(
    (t: any) => t.user.toString() === userId.toString()
  );

  if (activeTimerIndex > -1) {
    const startTime = new Date(task.activeTimers[activeTimerIndex].startTime).getTime();
    const endTime = new Date().getTime();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    task.activeTimers.splice(activeTimerIndex, 1);
    task.timeLogs.push({ user: userId, hours: durationHours, date: new Date() } as any);
    task.actualHours = (task.actualHours || 0) + durationHours;

    await task.save();
    res.json({ message: 'Timer stopped', duration: durationHours });
  } else {
    task.activeTimers.push({ user: userId, startTime: new Date() } as any);
    await task.save();
    res.json({ message: 'Timer started' });
  }
});