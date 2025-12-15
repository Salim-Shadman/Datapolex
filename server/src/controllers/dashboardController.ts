import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import User from '../models/User';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get dashboard stats (Optimized)
// @route   GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  // Parallel Execution
  // FIX: Removed .lean() from countDocuments as it returns a number directly in Promise
  const [totalProjects, activeProjects, totalUsers, budgetStats, hoursStats] = await Promise.all([
    Project.countDocuments(), 
    Project.countDocuments({ status: 'active' }),
    User.countDocuments(),
    Project.aggregate([{ $group: { _id: null, total: { $sum: '$budget' } } }]),
    Task.aggregate([{ $unwind: '$timeLogs' }, { $group: { _id: null, total: { $sum: '$timeLogs.hours' } } }])
  ]);

  const totalBudget = budgetStats[0]?.total || 0;
  const totalHours = hoursStats[0]?.total || 0;

  // Recent Projects with optimized aggregation
  const recentProjects = await Project.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 6 },
    {
        $lookup: { from: 'tasks', localField: '_id', foreignField: 'project', as: 'tasks' },
    },
    {
        $addFields: {
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: { input: '$tasks', as: 'task', cond: { $eq: ['$$task.status', 'done'] } },
            },
          },
        },
    },
    {
        $addFields: {
            progress: {
                $cond: {
                    if: { $eq: ['$totalTasks', 0] },
                    then: 0,
                    else: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                }
            }
        }
    },
    { $project: { tasks: 0 } }
  ]);

  // Personal Stats
  let myStats = {};

  // For members and managers, show their specific data
  if (userRole === 'member' || userRole === 'manager' || userRole === 'admin') {
     const myProjects = await Project.aggregate([
        {
            $lookup: { from: 'tasks', localField: '_id', foreignField: 'project', as: 'projectTasks' }
        },
        { $match: { 'projectTasks.assignees': userId } },
        { $sort: { updatedAt: -1 } },
        {
             $addFields: {
                totalTasks: { $size: '$projectTasks' },
                completedTasks: {
                    $size: {
                        $filter: { input: '$projectTasks', as: 'pt', cond: { $eq: ['$$pt.status', 'done'] } }
                    }
                }
             }
        },
        {
             $addFields: {
                progress: {
                    $cond: {
                        if: { $eq: ['$totalTasks', 0] },
                        then: 0,
                        else: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                    }
                }
             }
        },
        { $project: { projectTasks: 0 } }
     ]);

     const [pendingTasks, myHoursStats] = await Promise.all([
         Task.countDocuments({ assignees: userId, status: { $ne: 'done' } }),
         Task.aggregate([
            { $match: { 'timeLogs.user': userId } },
            { $unwind: '$timeLogs' },
            { $match: { 'timeLogs.user': userId } },
            { $group: { _id: null, total: { $sum: '$timeLogs.hours' } } }
         ])
     ]);

     myStats = {
         projects: myProjects,
         pendingTasks,
         totalHours: myHoursStats[0]?.total || 0
     };
  }

  res.json({
    projects: { total: totalProjects, active: activeProjects },
    budget: totalBudget,
    totalHours,
    totalUsers,
    recentProjects,
    myStats
  });
});