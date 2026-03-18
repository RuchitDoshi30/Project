import { Request, Response } from 'express';
import { User, Problem, AptitudeQuestion, Submission, UserProgress, AptitudeAttempt, AptitudeTest, PlacementDrive } from '../models';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ApiError } from '../middlewares/errorHandler';

/** Student: get own dashboard stats */
export const getStudentStats = asyncHandler(async (req: Request, res: Response) => {
  const progress = await UserProgress.findOne({ userId: req.user!.id });

  res.json({
    success: true,
    data: progress || {
      userId: req.user!.id,
      problemsSolved: { easy: 0, medium: 0, hard: 0 },
      aptitudeTestsTaken: 0,
      totalSubmissions: 0,
      lastActiveDate: null,
    },
  });
});

/** Admin: get aggregate platform stats */
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalStudents, totalProblems, totalAptitudeQuestions, pendingSubmissions, totalSubmissions] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Problem.countDocuments(),
      AptitudeQuestion.countDocuments(),
      Submission.countDocuments({ status: 'Pending Review' }),
      Submission.countDocuments(),
    ]);

  const activeStudents = await User.countDocuments({ role: 'student', accountStatus: 'active' });

  // Submissions this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const submissionsThisWeek = await Submission.countDocuments({ submittedAt: { $gte: oneWeekAgo } });

  // Submissions today
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const submissionsToday = await Submission.countDocuments({ submittedAt: { $gte: startOfDay } });

  // Approval rate
  const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });
  const approvalRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  // Problems by difficulty
  const problemsByDifficulty = {
    Beginner: await Problem.countDocuments({ difficulty: 'Beginner' }),
    Intermediate: await Problem.countDocuments({ difficulty: 'Intermediate' }),
    Advanced: await Problem.countDocuments({ difficulty: 'Advanced' }),
  };

  // Aptitude by category
  const aptitudeByCategory = {
    Quantitative: await AptitudeQuestion.countDocuments({ category: 'Quantitative' }),
    Logical: await AptitudeQuestion.countDocuments({ category: 'Logical' }),
    Verbal: await AptitudeQuestion.countDocuments({ category: 'Verbal' }),
    Technical: await AptitudeQuestion.countDocuments({ category: 'Technical' }),
  };

  res.json({
    success: true,
    data: {
      totalStudents,
      activeStudents,
      newStudentsThisMonth: 0,
      totalProblems,
      totalAptitudeQuestions,
      pendingSubmissions,
      submissionsToday,
      submissionsThisWeek,
      approvalRate,
      averageProblemsPerStudent: totalStudents > 0 ? +(totalSubmissions / totalStudents).toFixed(1) : 0,
      problemsByDifficulty,
      aptitudeByCategory,
    },
  });
});

/** Admin: list all students */
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { search, cursor, limit = '20' } = req.query;
  const pageLimit = Math.min(parseInt(limit as string, 10) || 20, 100);
  const filter: any = { role: 'student' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { universityId: { $regex: search, $options: 'i' } },
    ];
  }
  if (cursor) filter._id = { $gt: cursor };

  const students = await User.find(filter).sort({ _id: 1 }).limit(pageLimit + 1);
  const hasMore = students.length > pageLimit;
  const data = hasMore ? students.slice(0, pageLimit) : students;
  res.json({ success: true, data, nextCursor: hasMore ? data[data.length - 1]._id : null, hasMore });
});

/** Admin: create student */
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await User.create({ ...req.body, role: 'student' });
  res.status(201).json({ success: true, data: student });
});

/** Admin: update student */
export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) throw new ApiError(404, 'Student not found');
  res.json({ success: true, data: student });
});

/** Admin: delete student */
export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await User.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found');
  res.json({ success: true, message: 'Student deleted' });
});

/** Admin: toggle student status */
export const toggleStudentStatus = asyncHandler(async (req: Request, res: Response) => {
  const student = await User.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found');
  student.accountStatus = student.accountStatus === 'active' ? 'disabled' : 'active';
  await student.save();
  res.json({ success: true, data: student });
});

/** Student: get recent activity (submissions + aptitude attempts) */
export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [submissions, attempts] = await Promise.all([
    Submission.find({ userId }).sort({ submittedAt: -1 }).limit(10).populate('problemId', 'title slug'),
    AptitudeAttempt.find({ userId }).sort({ completedAt: -1 }).limit(10).populate('testId', 'title'),
  ]);

  const activity: any[] = [];

  for (const sub of submissions) {
    const problem = sub.problemId as any;
    activity.push({
      id: sub._id,
      type: 'coding',
      title: problem?.title || 'Unknown Problem',
      status: sub.status === 'Accepted' ? 'completed' : 'attempted',
      timestamp: sub.submittedAt,
      score: (sub.totalTestCases || 0) > 0 ? Math.round(((sub.testCasesPassed || 0) / (sub.totalTestCases || 1)) * 100) : undefined,
    });
  }

  for (const attempt of attempts) {
    const test = attempt.testId as any;
    activity.push({
      id: attempt._id,
      type: 'aptitude',
      title: test?.title || 'Unknown Test',
      status: attempt.passed ? 'passed' : 'failed',
      timestamp: attempt.completedAt,
      score: attempt.score,
    });
  }

  // Sort by timestamp descending, take top 10
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, data: activity.slice(0, 10) });
});

/** Public: leaderboard (top 50 students by score) */
export const getLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const progressRecords = await UserProgress.find()
    .sort({ 'problemsSolved.hard': -1, 'problemsSolved.medium': -1 })
    .limit(100)
    .lean();

  // Fetch user details for these records
  const userIds = progressRecords.map(p => p.userId);
  const users = await User.find({ _id: { $in: userIds }, role: 'student' }).select('name universityId branch').lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const leaderboard = progressRecords
    .map(p => {
      const user = userMap.get(p.userId.toString());
      if (!user) return null;
      const easy = p.problemsSolved?.easy || 0;
      const medium = p.problemsSolved?.medium || 0;
      const hard = p.problemsSolved?.hard || 0;
      const totalSolved = easy + medium + hard;
      const score = easy * 10 + medium * 25 + hard * 50 + (p.aptitudeTestsTaken || 0) * 5;
      return {
        name: user.name,
        universityId: user.universityId,
        studentId: user.universityId,
        branch: (user as any).branch || '',
        totalScore: score,
        problemsSolved: totalSolved,
        testsCompleted: p.aptitudeTestsTaken || 0,
        successRate: p.totalSubmissions > 0 ? Math.round((totalSolved / p.totalSubmissions) * 100) : 0,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.totalScore - a.totalScore)
    .slice(0, 50);

  res.json({ success: true, data: leaderboard });
});

/** Admin: aggregate reports */
export const getReports = asyncHandler(async (_req: Request, res: Response) => {
  const branches = ['CS', 'IT', 'EC', 'EE', 'ME', 'CE'];

  // --- Placement Stats ---
  const [totalStudents, totalDrives] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    PlacementDrive.countDocuments(),
  ]);

  // Count placed students from drives
  const drives = await PlacementDrive.find().select('selectedStudents packageLPA').lean();
  const placedStudentIds = new Set<string>();
  let totalPackage = 0;
  let highestPackage = 0;
  for (const drive of drives) {
    const selected = (drive as any).selectedStudents || [];
    for (const sid of selected) {
      placedStudentIds.add(sid.toString());
    }
    const pkg = (drive as any).packageLPA || 0;
    if (pkg > highestPackage) highestPackage = pkg;
    totalPackage += pkg * selected.length;
  }
  const totalPlaced = placedStudentIds.size;

  const placementStats = {
    totalEligible: totalStudents,
    totalPlaced,
    placementRate: totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0,
    avgPackage: totalPlaced > 0 ? (totalPackage / totalPlaced).toFixed(1) : '0.0',
    highestPackage: highestPackage.toFixed(1),
    companiesVisited: totalDrives,
  };

  // --- Branch-wise Performance ---
  const branchPerformance = await Promise.all(
    branches.map(async (branch) => {
      const branchStudents = await User.find({ role: 'student', branch }).select('_id').lean();
      const studentIds = branchStudents.map(s => s._id);
      const count = studentIds.length;
      if (count === 0) return { branch, students: 0, placed: 0, avgCoding: 0, avgAptitude: 0, placementRate: 0 };

      // Aggregate coding performance
      const progressRecords = await UserProgress.find({ userId: { $in: studentIds } }).lean();
      let totalCodingScore = 0;
      for (const p of progressRecords) {
        const solved = (p.problemsSolved?.easy || 0) + (p.problemsSolved?.medium || 0) + (p.problemsSolved?.hard || 0);
        const rate = p.totalSubmissions > 0 ? (solved / p.totalSubmissions) * 100 : 0;
        totalCodingScore += rate;
      }

      // Aggregate aptitude performance
      const attempts = await AptitudeAttempt.find({ userId: { $in: studentIds } }).lean();
      let totalAptitudeScore = 0;
      for (const a of attempts) {
        totalAptitudeScore += a.score || 0;
      }

      const placed = studentIds.filter(id => placedStudentIds.has(id.toString())).length;

      return {
        branch,
        students: count,
        placed,
        avgCoding: progressRecords.length > 0 ? Math.round(totalCodingScore / progressRecords.length) : 0,
        avgAptitude: attempts.length > 0 ? Math.round(totalAptitudeScore / attempts.length) : 0,
        placementRate: count > 0 ? Math.round((placed / count) * 100) : 0,
      };
    })
  );

  // --- Top Performers ---
  const allProgress = await UserProgress.find().lean();
  const allUserIds = allProgress.map(p => p.userId);
  const allUsers = await User.find({ _id: { $in: allUserIds }, role: 'student' }).select('name branch universityId').lean();
  const allUserMap = new Map(allUsers.map(u => [u._id.toString(), u]));

  const topPerformers = allProgress
    .map(p => {
      const user = allUserMap.get(p.userId.toString());
      if (!user) return null;
      const easy = p.problemsSolved?.easy || 0;
      const med = p.problemsSolved?.medium || 0;
      const hard = p.problemsSolved?.hard || 0;
      const codingScore = p.totalSubmissions > 0 ? Math.round(((easy + med + hard) / p.totalSubmissions) * 100) : 0;
      const overall = codingScore; // Simplified — could incorporate aptitude
      return {
        name: user.name,
        branch: (user as any).branch || '',
        codingScore,
        aptitudeScore: 0, // Will be enriched below
        overall,
        status: placedStudentIds.has(p.userId.toString()) ? 'Placed' : 'Unplaced',
        company: '-',
        _userId: p.userId.toString(),
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.overall - a.overall)
    .slice(0, 10)
    .map((entry: any, idx: number) => ({ rank: idx + 1, ...entry }));

  // Enrich top performers with aptitude scores
  for (const performer of topPerformers) {
    const attempts = await AptitudeAttempt.find({ userId: (performer as any)._userId }).lean();
    if (attempts.length > 0) {
      const avgScore = Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length);
      (performer as any).aptitudeScore = avgScore;
      (performer as any).overall = Math.round(((performer as any).codingScore + avgScore) / 2);
    }
  }

  // --- Weak Topics (from problem tags with low pass rates) ---
  const problemsWithTags = await Problem.find().select('_id tags').lean();
  const tagStats: Record<string, { attempts: number; passed: number }> = {};
  for (const prob of problemsWithTags) {
    const subs = await Submission.countDocuments({ problemId: prob._id });
    const accepted = await Submission.countDocuments({ problemId: prob._id, status: 'Accepted' });
    for (const tag of prob.tags || []) {
      if (!tagStats[tag]) tagStats[tag] = { attempts: 0, passed: 0 };
      tagStats[tag].attempts += subs;
      tagStats[tag].passed += accepted;
    }
  }

  const weakTopics = Object.entries(tagStats)
    .map(([topic, stats]) => ({
      topic,
      avgScore: stats.attempts > 0 ? Math.round((stats.passed / stats.attempts) * 100) : 0,
      totalAttempts: stats.attempts,
      category: 'Coding',
    }))
    .filter(t => t.totalAttempts > 0)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 10);

  // --- Readiness Breakdown ---
  let ready = 0;
  let needsWork = 0;
  let notStarted = 0;
  for (const p of allProgress) {
    const solved = (p.problemsSolved?.easy || 0) + (p.problemsSolved?.medium || 0) + (p.problemsSolved?.hard || 0);
    const rate = p.totalSubmissions > 0 ? (solved / p.totalSubmissions) * 100 : 0;
    if (rate >= 70) ready++;
    else if (solved > 0) needsWork++;
    else notStarted++;
  }
  // Add students with no progress records
  const studentsWithProgress = allProgress.length;
  const studentsWithoutProgress = totalStudents - studentsWithProgress;
  notStarted += studentsWithoutProgress;

  res.json({
    success: true,
    data: {
      placementStats,
      branchPerformance: branchPerformance.filter(b => b.students > 0),
      topPerformers,
      weakTopics,
      readiness: { ready, needsWork, notStarted },
    },
  });
});

