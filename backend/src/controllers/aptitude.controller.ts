import { Request, Response } from 'express';
import { AptitudeQuestion, AptitudeTest, AptitudeAttempt } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

// ---- Questions (Admin) ----
export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { category, difficulty, cursor, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 100);
  const filter: any = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (cursor) filter._id = { $gt: cursor };

  const questions = await AptitudeQuestion.find(filter).sort({ _id: 1 }).limit(pageLimit + 1);
  const hasMore = questions.length > pageLimit;
  const data = hasMore ? questions.slice(0, pageLimit) : questions;
  res.json({ success: true, data, nextCursor: hasMore ? data[data.length - 1]._id : null, hasMore });
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await AptitudeQuestion.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await AptitudeQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!question) throw new ApiError(404, 'Question not found');
  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await AptitudeQuestion.findByIdAndDelete(req.params.id);
  if (!question) throw new ApiError(404, 'Question not found');
  res.json({ success: true, message: 'Question deleted' });
});

// ---- Tests ----
export const getTests = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, cursor, page, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);
  const filter: any = {};
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };

  let data;
  let nextCursor = null;
  let hasMore = false;
  let total = 0;
  let totalPages = 0;
  let currentPage = 1;

  if (page) {
    currentPage = parseInt(page as string, 10) || 1;
    const skip = (currentPage - 1) * pageLimit;
    
    total = await AptitudeTest.countDocuments(filter);
    totalPages = Math.ceil(total / pageLimit);
    
    data = await AptitudeTest.find(filter)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(pageLimit);
      
    hasMore = currentPage < totalPages;
  } else {
    if (cursor) filter._id = { $gt: cursor };
    const tests = await AptitudeTest.find(filter).sort({ _id: 1 }).limit(pageLimit + 1);
    hasMore = tests.length > pageLimit;
    data = hasMore ? tests.slice(0, pageLimit) : tests;
    nextCursor = hasMore ? data[data.length - 1]._id : null;
  }
  
  res.json({ success: true, data, nextCursor, hasMore, total, page: currentPage, totalPages });
});

export const getTestById = asyncHandler(async (req: Request, res: Response) => {
  const test = await AptitudeTest.findById(req.params.id).populate('questions');
  if (!test) throw new ApiError(404, 'Test not found');

  // For students, hide correctOptionIndex
  const testObj = test.toObject();
  if (req.user?.role !== 'admin') {
    testObj.questions = (testObj.questions as any[]).map((q: any) => {
      const { correctOptionIndex, ...rest } = q;
      return rest;
    });
  }
  res.json({ success: true, data: testObj });
});

export const createTest = asyncHandler(async (req: Request, res: Response) => {
  const test = await AptitudeTest.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: test });
});

// ---- Attempts ----
export const submitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { testId, answers } = req.body;

  const test = await AptitudeTest.findById(testId).populate('questions');
  if (!test) throw new ApiError(404, 'Test not found');

  const questions = test.questions as any[];
  let correctCount = 0;
  answers.forEach((ans: { questionId: string; selectedOption: number }) => {
    const q = questions.find((q: any) => q._id.toString() === ans.questionId);
    if (q && q.correctOptionIndex === ans.selectedOption) correctCount++;
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= (test.passingPercentage || 60);

  const attempt = await AptitudeAttempt.create({
    testId,
    userId: req.user!.id,
    answers,
    score,
    totalQuestions: questions.length,
    passed,
    completedAt: new Date(),
  });

  res.status(201).json({ success: true, data: attempt });
});

export const getMyAttempts = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 50);

  const filter: any = { userId: req.user!.id };
  if (cursor) filter._id = { $lt: cursor };

  const attempts = await AptitudeAttempt.find(filter)
    .sort({ _id: -1 })
    .limit(pageLimit + 1)
    .populate('testId', 'title category duration');

  const hasMore = attempts.length > pageLimit;
  const data = hasMore ? attempts.slice(0, pageLimit) : attempts;
  const nextCursor = hasMore ? data[data.length - 1]._id : null;

  res.json({ success: true, data, nextCursor, hasMore });
});

export const getAttemptById = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await AptitudeAttempt.findById(req.params.id)
    .populate('testId');
  if (!attempt) throw new ApiError(404, 'Attempt not found');

  // Ownership check: students can only see their own
  if (req.user?.role !== 'admin' && attempt.userId.toString() !== req.user!.id) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({ success: true, data: attempt });
});
