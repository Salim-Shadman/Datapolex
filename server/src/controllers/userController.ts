import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all users with Full Stats
// @route   GET /api/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

  const [totalTaskCounts, completedTaskCounts, hourCounts] = await Promise.all([
      Task.aggregate([{ $unwind: '$assignees' }, { $group: { _id: '$assignees', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: { status: 'done' } }, { $unwind: '$assignees' }, { $group: { _id: '$assignees', count: { $sum: 1 } } }]),
      Task.aggregate([{ $unwind: '$timeLogs' }, { $group: { _id: '$timeLogs.user', totalHours: { $sum: '$timeLogs.hours' } } }])
  ]);

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

// @desc    Create new user (Admin)
// @route   POST /api/users
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, skills } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  const user = await User.create({
    name,
    email,
    password, 
    role: role || 'member',
    department: department || 'General',
    skills: skills || []
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Optional: Prevent deleting the last admin
    // const remainingAdmins = await User.countDocuments({ role: 'admin' });
    // if (user.role === 'admin' && remainingAdmins <= 1) {
    //     res.status(400);
    //     throw new Error('Cannot delete the last admin');
    // }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user by ID (Admin)
// @route   PUT /api/users/:id
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.department = req.body.department || user.department;
    user.skills = req.body.skills || user.skills;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      skills: updatedUser.skills
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
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
// @route   PUT /api/users/profile
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const updatedUser = await user.save();
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