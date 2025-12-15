import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all users with Full Stats
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

  // Run 3 Aggregations in Parallel for Speed
  const [totalTaskCounts, completedTaskCounts, hourCounts] = await Promise.all([
      // 1. Total Tasks per User
      Task.aggregate([
          { $unwind: '$assignees' },
          { $group: { _id: '$assignees', count: { $sum: 1 } } }
      ]),
      // 2. Completed Tasks per User
      Task.aggregate([
          { $match: { status: 'done' } },
          { $unwind: '$assignees' },
          { $group: { _id: '$assignees', count: { $sum: 1 } } }
      ]),
      // 3. Total Hours per User
      Task.aggregate([
          { $unwind: '$timeLogs' },
          { $group: { _id: '$timeLogs.user', totalHours: { $sum: '$timeLogs.hours' } } }
      ])
  ]);

  // Merge Stats with Users
  const usersWithStats = users.map((user: any) => {
      const totalStat = totalTaskCounts.find(t => t._id.toString() === user._id.toString());
      const completedStat = completedTaskCounts.find(c => c._id.toString() === user._id.toString());
      const hourStat = hourCounts.find(h => h._id.toString() === user._id.toString());
      
      return {
          ...user,
          totalTasks: totalStat ? totalStat.count : 0,
          completedTasks: completedStat ? completedStat.count : 0,
          totalHours: hourStat ? hourStat.totalHours : 0
      };
  });

  res.json(usersWithStats);
});

// @desc    Get user profile
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      skills: user.skills,
      avatar: user.avatar
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const updatedUser = await user.save(); // This will now work without error

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      skills: updatedUser.skills,
      avatar: updatedUser.avatar,
      token: req.headers.authorization?.split(' ')[1]
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});