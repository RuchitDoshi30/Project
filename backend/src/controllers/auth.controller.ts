import { Request, Response } from 'express';
import { User, UserProgress, Submission, AptitudeAttempt } from '../models';
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
      bio: user.bio,
      notifications: user.notifications,
      privacy: user.privacy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
    .select('name email universityId role branch semester enrollmentYear bio notifications privacy accountStatus createdAt updatedAt');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ success: true, user });
});

/** Update profile: name, bio, notifications, privacy */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  const { name, bio, notifications, privacy } = req.body;

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (notifications !== undefined) {
    user.notifications = { ...user.notifications, ...notifications };
  }
  if (privacy !== undefined) {
    user.privacy = { ...user.privacy, ...privacy };
  }

  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
      branch: user.branch,
      semester: user.semester,
      enrollmentYear: user.enrollmentYear,
      bio: user.bio,
      notifications: user.notifications,
      privacy: user.privacy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/** Change password: verify current, then hash & save new */
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  // Set the new password — the pre('save') hook will hash it automatically
  user.passwordHash = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

/** Download all user data as JSON */
export const downloadMyData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [user, progress, submissions, attempts] = await Promise.all([
    User.findById(userId).select('-passwordHash').lean(),
    UserProgress.findOne({ userId }).lean(),
    Submission.find({ userId }).sort({ submittedAt: -1 }).lean(),
    AptitudeAttempt.find({ userId }).sort({ completedAt: -1 }).lean(),
  ]);

  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    data: {
      profile: user,
      progress: progress || null,
      submissions,
      aptitudeAttempts: attempts,
      exportedAt: new Date().toISOString(),
    },
  });
});

/** Soft-delete account by disabling it */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.accountStatus = 'disabled';
  await user.save();

  res.json({ success: true, message: 'Account has been deactivated.' });
});
