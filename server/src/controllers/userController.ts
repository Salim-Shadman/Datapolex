import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import asyncHandler from '../middleware/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}


export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  
  if (req.query.simple === 'true') {
      const users = await User.find({})
        .select('_id name email role avatar department')
        .sort({ name: 1 })
        .lean();
      return res.json(users);
  }

 
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20; 
  const skip = (page - 1) * limit;

  
  const totalUsers = await User.countDocuments({});
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  
  const [totalTaskCounts, completedTaskCounts, hourCounts] = await Promise.all([
      Task.aggregate([
        { $unwind: '$assignees' }, 
        { $group: { _id: '$assignees', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { status: 'done' } }, 
        { $unwind: '$assignees' }, 
        { $group: { _id: '$assignees', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $unwind: '$timeLogs' }, 
        { $group: { _id: '$timeLogs.user', totalHours: { $sum: '$timeLogs.hours' } } }
      ])
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

  res.json({
    users: usersWithStats,
    page,
    pages: Math.ceil(totalUsers / limit),
    total: totalUsers
  });
});


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


export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


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