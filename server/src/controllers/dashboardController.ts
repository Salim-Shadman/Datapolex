import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import User from '../models/User';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const [totalProjects, activeProjects, totalUsers, budgetStats, hoursStats, taskDistribution] = await Promise.all([
    Project.countDocuments(), 
    Project.countDocuments({ status: 'active' }),
    User.countDocuments(),
    Project.aggregate([{ $group: { _id: null, total: { $sum: '$budget' } } }]),
    Task.aggregate([{ $unwind: '$timeLogs' }, { $group: { _id: null, total: { $sum: '$timeLogs.hours' } } }]),
    // New: Task Distribution for Charts
    Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const totalBudget = budgetStats[0]?.total || 0;
  const totalHours = hoursStats[0]?.total || 0;

  // Format chart data
  const chartData = [
    { name: 'To Do', value: taskDistribution.find(t => t._id === 'todo')?.count || 0, color: '#94a3b8' },
    { name: 'In Progress', value: taskDistribution.find(t => t._id === 'in-progress')?.count || 0, color: '#3b82f6' },
    { name: 'Review', value: taskDistribution.find(t => t._id === 'review')?.count || 0, color: '#a855f7' },
    { name: 'Done', value: taskDistribution.find(t => t._id === 'done')?.count || 0, color: '#22c55e' },
  ];

  const recentProjects = await Project.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 6 },
    { $lookup: { from: 'tasks', localField: '_id', foreignField: 'project', as: 'tasks' } },
    {
        $addFields: {
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: { $filter: { input: '$tasks', as: 'task', cond: { $eq: ['$$task.status', 'done'] } } },
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

  let myStats = {};

  if (userRole === 'member' || userRole === 'manager' || userRole === 'admin') {
     const myProjects = await Project.aggregate([
        { $lookup: { from: 'tasks', localField: '_id', foreignField: 'project', as: 'projectTasks' } },
        { $match: { 'projectTasks.assignees': userId } },
        { $sort: { updatedAt: -1 } },
        {
             $addFields: {
                totalTasks: { $size: '$projectTasks' },
                completedTasks: {
                    $size: { $filter: { input: '$projectTasks', as: 'pt', cond: { $eq: ['$$pt.status', 'done'] } } }
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
    chartData, // Sent to frontend
    myStats
  });
});