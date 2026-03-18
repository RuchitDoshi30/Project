import { Request, Response } from 'express';
import { User } from '../models';
import { signToken } from '../utils/jwt';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, accountStatus: 'active' }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
      branch: user.branch,
      semester: user.semester,
      enrollmentYear: user.enrollmentYear,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ success: true, user });
});
