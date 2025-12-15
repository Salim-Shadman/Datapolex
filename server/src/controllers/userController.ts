import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from '../middleware/asyncHandler';

// @desc    Get all users (Team members)
// @route   GET /api/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}); // select('-password') আর লাগবে না কারণ মডেল এ ডিফল্ট false করা আছে
  res.json(users);
});

// @desc    Update user role/details
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
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
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