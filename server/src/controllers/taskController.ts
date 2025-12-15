import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import asyncHandler from '../middleware/asyncHandler';

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, project, sprint, assignees, priority, dueDate, status } = req.body;

  // 1. Project valid kina check
  const projectExists = await Project.findById(project);
  if (!projectExists) {
    res.status(404);
    throw new Error('Project not found');
  }

  // 2. Task create
  const task = await Task.create({
    title,
    description,
    project,
    sprint: sprint || null, // Sprint optional hote pare
    assignees,
    priority,
    dueDate,
    status: status || 'todo'
  });

  // Populate data for frontend immediately
  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email avatar')
    .populate('sprint', 'title sprintNumber');

  res.status(201).json(populatedTask);
});

// @desc    Get all tasks (Filter by Project or Sprint)
// @route   GET /api/tasks
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, sprintId } = req.query;

  let query: any = {};

  if (projectId) {
    query.project = projectId;
  }
  
  if (sprintId) {
    query.sprint = sprintId;
  }

  // FIX: 'as any' casting to avoid TS2769 error
  const tasks = await Task.find(query as any)
    .populate('assignees', 'name email avatar')
    .populate('sprint', 'title sprintNumber')
    .populate('comments.user', 'name avatar') // For comments
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// @desc    Update task status (Drag & Drop) or Details
// @route   PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    // Update fields if provided
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    
    // Assignees update logic
    if (req.body.assignees) {
        task.assignees = req.body.assignees;
    }
    
    // Sprint update (Moving task to another sprint)
    if (req.body.sprint !== undefined) {
        task.sprint = req.body.sprint;
    }

    // Time Logs Add Logic
    if (req.body.timeLog) {
        task.timeLogs.push(req.body.timeLog);
        // Calculate actualHours automatically
        task.actualHours = task.timeLogs.reduce((acc, log) => acc + log.hours, 0);
    }

    // Comments Add Logic
    if (req.body.comment) {
        task.comments.push(req.body.comment);
    }

    const updatedTask = await task.save();
    
    // Return populated data
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