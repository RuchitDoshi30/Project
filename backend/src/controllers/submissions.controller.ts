import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Submission, Problem, UserProgress, User } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

/** Student: submit code with test case results */
export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { problemId, code, language, testCasesPassed, totalTestCases } = req.body;

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');

  // Determine status dynamically based on test results
  const total = totalTestCases ?? problem.testCases.length;
  const passed = testCasesPassed ?? 0;
  let status: string;
  if (passed === total && total > 0) {
    status = 'Accepted';
  } else {
    status = 'Wrong Answer';
  }

  // Content-hash idempotency: hash(userId + problemId + code)
  const idempotencyHash = crypto
    .createHash('sha256')
    .update(`${req.user!.id}:${problemId}:${code}`)
    .digest('hex');

  try {
    const submission = await Submission.create({
      problemId,
      userId: req.user!.id,
      code,
      language,
      status,
      testCasesPassed: passed,
      totalTestCases: total,
      idempotencyHash,
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err: any) {
    // Catch MongoDB duplicate key error (E11000) from unique index on (userId, idempotencyHash)
    if (err.code === 11000 && err.keyPattern?.idempotencyHash) {
      const existing = await Submission.findOne({ userId: req.user!.id, idempotencyHash }).lean();
      return res.status(200).json({ success: true, data: existing, duplicate: true });
    }
    throw err;
  }
});

/** Student: get own submissions */
export const getMySubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const filter: any = { userId: req.user!.id };
  if (cursor) filter._id = { $lt: cursor };

  const submissions = await Submission.find(filter)
    .sort({ _id: -1 })
    .limit(pageLimit + 1)
    .populate('problemId', 'title slug difficulty');

  const hasMore = submissions.length > pageLimit;
  const data = hasMore ? submissions.slice(0, pageLimit) : submissions;
  const nextCursor = hasMore ? data[data.length - 1]._id : null;

  res.json({ success: true, data, nextCursor, hasMore });
});

/** Student: get own submissions for a specific problem */
export const getMySubmissionsForProblem = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await Submission.find({
    userId: req.user!.id,
    problemId: req.params.problemId,
  }).sort({ submittedAt: -1 }).limit(50);

  res.json({ success: true, data: submissions });
});

/** Admin: get all submissions with filters */
export const getAllSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { status, cursor, limit = '20', search } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const filter: any = {};
  if (status) filter.status = status;
  if (cursor) filter._id = { $lt: cursor };

  // Server-side search: find matching problem IDs and user IDs first
  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const [matchingProblems, matchingUsers] = await Promise.all([
      Problem.find({ title: { $regex: searchRegex } }).select('_id').lean(),
      User.find({ $or: [{ name: { $regex: searchRegex } }, { universityId: { $regex: searchRegex } }] }).select('_id').lean(),
    ]);
    const problemIds = matchingProblems.map(p => p._id);
    const userIds = matchingUsers.map(u => u._id);
    filter.$or = [
      ...(problemIds.length > 0 ? [{ problemId: { $in: problemIds } }] : []),
      ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
    ];
    // If no matches at all, force empty result
    if (!filter.$or.length) {
      res.json({ success: true, data: [], nextCursor: null, hasMore: false });
      return;
    }
  }

  const submissions = await Submission.find(filter)
    .sort({ _id: -1 })
    .limit(pageLimit + 1)
    .populate('userId', 'name email universityId')
    .populate('problemId', 'title slug difficulty');

  const hasMore = submissions.length > pageLimit;
  const data = hasMore ? submissions.slice(0, pageLimit) : submissions;
  const nextCursor = hasMore ? data[data.length - 1]._id : null;

  res.json({ success: true, data, nextCursor, hasMore });
});

/** Admin: approve submission (wrapped in transaction for atomic consistency) */
export const approveSubmission = asyncHandler(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      // Use findByIdAndUpdate to skip post-save hook (we handle UserProgress explicitly below)
      const submission = await Submission.findByIdAndUpdate(
        req.params.id,
        { status: 'Accepted' },
        { new: true, session }
      );
      if (!submission) throw new ApiError(404, 'Submission not found');

      // Check if this was already accepted (skip UserProgress update if so)
      const previousAccepted = await Submission.countDocuments({
        userId: submission.userId,
        problemId: submission.problemId,
        status: 'Accepted',
        _id: { $ne: submission._id },
      }).session(session);

      // Only update UserProgress if this is the first accepted submission for this problem
      if (previousAccepted === 0) {
        const problem = await Problem.findById(submission.problemId).select('difficulty').session(session);
        if (problem) {
          const difficultyMap: Record<string, string> = {
            'Beginner': 'problemsSolved.easy',
            'Intermediate': 'problemsSolved.medium',
            'Advanced': 'problemsSolved.hard',
          };
          const field = difficultyMap[problem.difficulty];
          if (field) {
            await UserProgress.findOneAndUpdate(
              { userId: submission.userId },
              { $inc: { [field]: 1 }, $set: { lastActiveDate: new Date() } },
              { upsert: true, session }
            );
          }
        }
      }

      result = submission;
    });
    res.json({ success: true, data: result });
  } finally {
    await session.endSession();
  }
});

/** Admin: reject submission */
export const rejectSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status: 'Wrong Answer' },
    { new: true }
  );
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.json({ success: true, data: submission });
});
