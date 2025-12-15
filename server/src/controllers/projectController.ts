import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task'; // Task import added
import asyncHandler from '../middleware/asyncHandler'; // AsyncHandler added

// @desc    Create a project
// @route   POST /api/projects
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// @desc    Get all projects with WEIGHTED progress stats
// @route   GET /api/projects
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { status, client } = req.query;
  
  let matchStage: any = {};
  if (status) matchStage.status = status;
  if (client) matchStage.client = { $regex: client, $options: 'i' };

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
      $project: {
        tasks: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res.json(projects);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

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

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    // FIX: Delete associated tasks
    await Task.deleteMany({ project: req.params.id } as any);
    
    await project.deleteOne();
    res.json({ message: 'Project and associated tasks removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});