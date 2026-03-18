import { Request, Response } from 'express';
import { Submission, Problem } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

/** Student: submit code for review */
export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { problemId, code, language } = req.body;

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');

  const submission = await Submission.create({
    problemId,
    userId: req.user!.id,
    code,
    language,
    status: 'Pending Review',
    totalTestCases: problem.testCases.length,
  });

  res.status(201).json({ success: true, data: submission });
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
  }).sort({ submittedAt: -1 });

  res.json({ success: true, data: submissions });
});

/** Admin: get all submissions with filters */
export const getAllSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { status, cursor, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const filter: any = {};
  if (status) filter.status = status;
  if (cursor) filter._id = { $lt: cursor };

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

/** Admin: approve submission */
export const approveSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status: 'Accepted' },
    { new: true }
  );
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.json({ success: true, data: submission });
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
