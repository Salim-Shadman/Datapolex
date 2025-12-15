import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Task from '../models/Task';
import Sprint from '../models/Sprint';
import asyncHandler from '../middleware/asyncHandler';

// @desc    Create a project
// @route   POST /api/projects
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// @desc    Get all projects with Pagination & Stats
// @route   GET /api/projects
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { status, client, page, limit } = req.query;
  
  let matchStage: any = {};
  if (status) matchStage.status = status;
  
  if (client) {
     matchStage.client = { $regex: client, $options: 'i' };
  }

  // Pagination Logic
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 100;
  const skip = (pageNum - 1) * limitNum;

  const projects = await Project.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'project',
        as: 'tasks',
      },
    },
    {
      $addFields: {
        totalTasks: { $size: '$tasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 'task',
              cond: { $eq: ['$$task.status', 'done'] },
            },
          },
        },
        progressScore: {
          $sum: {
            $map: {
              input: '$tasks',
              as: 't',
              in: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$$t.status', 'done'] }, then: 1 },
                    { case: { $eq: ['$$t.status', 'review'] }, then: 0.8 },
                    { case: { $eq: ['$$t.status', 'in-progress'] }, then: 0.5 },
                  ],
                  default: 0
                }
              }
            }
          }
        }
      },
    },
    {
      $addFields: {
        progress: {
          $cond: {
            if: { $eq: ['$totalTasks', 0] },
            then: 0,
            else: { 
              $multiply: [
                { $divide: ['$progressScore', '$totalTasks'] }, 
                100 
              ] 
            }
          }
        }
      }
    },
    {
      $project: { tasks: 0 },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limitNum }
  ]);

  res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete project (Secure Transaction)
// @route   DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  // Start a MongoDB Session for Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(req.params.id).session(session);

    if (!project) {
      await session.abortTransaction();
      session.endSession();
      res.status(404);
      throw new Error('Project not found');
    }

    // FIX: 'as any' ব্যবহার করা হয়েছে টাইপ এরর এড়াতে
    // 1. Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id } as any).session(session);
    
    // 2. Delete all sprints associated with this project
    await Sprint.deleteMany({ project: req.params.id } as any).session(session);
    
    // 3. Delete the project itself
    await project.deleteOne({ session });

    // Commit changes if everything is successful
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Project and all associated data removed securely' });
  } catch (error) {
    // If any error occurs, rollback all changes
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});