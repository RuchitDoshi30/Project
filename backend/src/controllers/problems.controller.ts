import { Request, Response } from 'express';
import { Problem } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

export const getProblems = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, tags, search, cursor, page, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const filter: any = {};
  if (difficulty) filter.difficulty = { $in: (difficulty as string).split(',') };
  if (tags) filter.tags = { $in: (tags as string).split(',') };
  if (search) filter.$text = { $search: search as string };

  let data;
  let nextCursor = null;
  let hasMore = false;
  let total = 0;
  let totalPages = 0;
  let currentPage = 1;

  if (page) {
    currentPage = parseInt(page as string, 10) || 1;
    const skip = (currentPage - 1) * pageLimit;
    
    total = await Problem.countDocuments(filter);
    totalPages = Math.ceil(total / pageLimit);
    
    data = await Problem.find(filter)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(pageLimit)
      .select('-testCases.expectedOutput');
      
    hasMore = currentPage < totalPages;
  } else {
    if (cursor) filter._id = { $gt: cursor };
    const problems = await Problem.find(filter)
      .sort({ _id: 1 })
      .limit(pageLimit + 1)
      .select('-testCases.expectedOutput');

    hasMore = problems.length > pageLimit;
    data = hasMore ? problems.slice(0, pageLimit) : problems;
    nextCursor = hasMore ? data[data.length - 1]._id : null;
  }

  res.json({ success: true, data, nextCursor, hasMore, total, page: currentPage, totalPages });
});

export const getProblemBySlug = asyncHandler(async (req: Request, res: Response) => {
  const problem = await Problem.findOne({ slug: req.params.slug });
  if (!problem) throw new ApiError(404, 'Problem not found');

  // Hide expected output of hidden test cases for students
  const cleaned = problem.toObject();
  if (req.user?.role !== 'admin') {
    cleaned.testCases = cleaned.testCases.map((tc: any) =>
      tc.isHidden ? { ...tc, expectedOutput: '[Hidden]' } : tc
    );
  }
  res.json({ success: true, data: cleaned });
});

export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await Problem.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: problem });
});

export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!problem) throw new ApiError(404, 'Problem not found');
  res.json({ success: true, data: problem });
});

export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) throw new ApiError(404, 'Problem not found');
  res.json({ success: true, message: 'Problem deleted' });
});
