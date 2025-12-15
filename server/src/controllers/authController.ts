import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import asyncHandler from '../middleware/asyncHandler'; // Ensure this exists

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'member'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString())
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Explicitly select password since we added select: false in model
  const user = await User.findOne({ email }).select('+password');

  if (user && (await bcrypt.compare(password, user.password as string))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString())
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});