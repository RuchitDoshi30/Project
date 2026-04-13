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
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

  // All counts in parallel
  const [
    totalStudents, activeStudents, totalProblems, totalAptitudeQuestions,
    pendingSubmissions, totalSubmissions, acceptedSubmissions,
    submissionsThisWeek, submissionsToday,
    difficultyAgg, categoryAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', accountStatus: 'active' }),
    Problem.countDocuments(),
    AptitudeQuestion.countDocuments(),
    Submission.countDocuments({ status: 'Pending Review' }),
    Submission.countDocuments(),
    Submission.countDocuments({ status: 'Accepted' }),
    Submission.countDocuments({ submittedAt: { $gte: oneWeekAgo } }),
    Submission.countDocuments({ submittedAt: { $gte: startOfDay } }),
    Problem.aggregate([{ $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
    AptitudeQuestion.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const approvalRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  const problemsByDifficulty: Record<string, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  for (const d of difficultyAgg) { if (d._id) problemsByDifficulty[d._id] = d.count; }

  const aptitudeByCategory: Record<string, number> = { Quantitative: 0, Logical: 0, Verbal: 0, Technical: 0 };
  for (const c of categoryAgg) { if (c._id) aptitudeByCategory[c._id] = c.count; }

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
    User.countDocuments({ role: 'student' }).maxTimeMS(10000),
    PlacementDrive.countDocuments().maxTimeMS(10000),
  ]);

  // Count placed students from drives
  const drives = await PlacementDrive.find().select('selectedStudents packageLPA').lean().maxTimeMS(10000);
  let totalPlaced = 0;
  let totalPackage = 0;
  let highestPackage = 0;
  for (const drive of drives) {
    const selected = (drive as any).selectedStudents || 0;
    totalPlaced += typeof selected === 'number' ? selected : 0;
    const pkg = parseFloat((drive as any).packageLPA) || 0;
    if (pkg > highestPackage) highestPackage = pkg;
    totalPackage += pkg * (typeof selected === 'number' ? selected : 0);
  }

  const placementStats = {
    totalEligible: totalStudents,
    totalPlaced,
    placementRate: totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0,
    avgPackage: totalPlaced > 0 ? (totalPackage / totalPlaced).toFixed(1) : '0.0',
    highestPackage: highestPackage.toFixed(1),
    companiesVisited: totalDrives,
  };

  // --- Bulk fetch all data (eliminates N+1 queries) ---
  const [allStudents, allProgress, allAttempts] = await Promise.all([
    User.find({ role: 'student' }).select('_id branch name universityId').lean().maxTimeMS(10000),
    UserProgress.find().lean().maxTimeMS(10000),
    AptitudeAttempt.find().select('userId score').lean().maxTimeMS(10000),
  ]);

  // Build lookup maps
  const progressByUser = new Map(allProgress.map(p => [p.userId?.toString() || '', p]));
  const attemptsByUser = new Map<string, typeof allAttempts>();
  for (const a of allAttempts) {
    if (!a.userId) continue;
    const uid = a.userId.toString();
    if (!attemptsByUser.has(uid)) attemptsByUser.set(uid, []);
    attemptsByUser.get(uid)!.push(a);
  }

  // --- Branch-wise Performance (computed in memory) ---
  const branchPerformance = branches.map(branch => {
    const branchStudents = allStudents.filter(s => (s as any).branch === branch);
    const count = branchStudents.length;
    if (count === 0) return { branch, students: 0, placed: 0, avgCoding: 0, avgAptitude: 0, placementRate: 0 };

    let totalCodingScore = 0;
    let progressCount = 0;
    let totalAptitudeScore = 0;
    let aptitudeCount = 0;

    for (const s of branchStudents) {
      const p = progressByUser.get(s._id.toString());
      if (p) {
        const solved = (p.problemsSolved?.easy || 0) + (p.problemsSolved?.medium || 0) + (p.problemsSolved?.hard || 0);
        const rate = p.totalSubmissions > 0 ? (solved / p.totalSubmissions) * 100 : 0;
        totalCodingScore += rate;
        progressCount++;
      }
      const userAttempts = attemptsByUser.get(s._id.toString()) || [];
      for (const a of userAttempts) {
        totalAptitudeScore += a.score || 0;
        aptitudeCount++;
      }
    }

    return {
      branch,
      students: count,
      placed: 0,
      avgCoding: progressCount > 0 ? Math.round(totalCodingScore / progressCount) : 0,
      avgAptitude: aptitudeCount > 0 ? Math.round(totalAptitudeScore / aptitudeCount) : 0,
      placementRate: 0,
    };
  });

  // --- Top Performers (computed in memory) ---
  const allUserMap = new Map(allStudents.map(u => [u._id?.toString() || '', u]));

  const topPerformers = allProgress
    .map(p => {
      if (!p.userId) return null;
      const user = allUserMap.get(p.userId.toString());
      if (!user) return null;
      const easy = p.problemsSolved?.easy || 0;
      const med = p.problemsSolved?.medium || 0;
      const hard = p.problemsSolved?.hard || 0;
      const codingScore = p.totalSubmissions > 0 ? Math.round(((easy + med + hard) / p.totalSubmissions) * 100) : 0;
      const userAttempts = attemptsByUser.get(p.userId.toString()) || [];
      const aptitudeScore = userAttempts.length > 0
        ? Math.round(userAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / userAttempts.length)
        : 0;
      const overall = userAttempts.length > 0 ? Math.round((codingScore + aptitudeScore) / 2) : codingScore;
      return {
        name: user.name,
        branch: (user as any).branch || '',
        codingScore,
        aptitudeScore,
        overall,
        status: 'Active',
        company: '-',
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.overall - a.overall)
    .slice(0, 10)
    .map((entry: any, idx: number) => ({ rank: idx + 1, ...entry }));

  // --- Weak Topics (aggregation pipeline instead of N+1) ---
  const [submissionTagAgg] = await Promise.all([
    Submission.aggregate([
      { $group: { _id: { problemId: '$problemId', status: '$status' }, count: { $sum: 1 } } },
    ]).option({ maxTimeMS: 10000 }),
  ]);

  // Map problem IDs to tags
  const problemsWithTags = await Problem.find().select('_id tags').lean().maxTimeMS(10000);
  const problemTagMap = new Map(problemsWithTags.map(p => [p._id?.toString() || '', p.tags || []]));

  const tagStats: Record<string, { attempts: number; passed: number }> = {};
  for (const agg of submissionTagAgg) {
    if (!agg._id?.problemId) continue;
    const tags = problemTagMap.get(agg._id.problemId.toString()) || [];
    for (const tag of tags) {
      if (!tagStats[tag]) tagStats[tag] = { attempts: 0, passed: 0 };
      tagStats[tag].attempts += agg.count;
      if (agg._id.status === 'Accepted') tagStats[tag].passed += agg.count;
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

/**
 * Student: Smart Recommendations
 * 
 * Multi-signal scoring algorithm:
 *  1. Retry-worthy: problems the student attempted but didn't solve
 *  2. Weak tags: tags where the student has low acceptance rate
 *  3. Difficulty progression: next appropriate difficulty based on solve count
 *  4. Fresh topics: tags the student hasn't explored yet
 *  5. Popular: problems with high submission count the student hasn't tried
 */
export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // 1. Fetch all user data in parallel
  const [submissions, attempts, progress, allProblems] = await Promise.all([
    Submission.find({ userId }).select('problemId status').limit(500).lean(),
    AptitudeAttempt.find({ userId }).select('testId score passed').limit(100).populate('testId', 'category').lean(),
    UserProgress.findOne({ userId }).lean(),
    Problem.find().select('slug title difficulty tags').limit(1000).lean(),
  ]);

  // 2. Build user profile from submissions
  const solvedProblemIds = new Set<string>();
  const attemptedProblemIds = new Set<string>();
  const tagSubmissions: Record<string, { total: number; accepted: number }> = {};

  for (const sub of submissions) {
    const pid = sub.problemId.toString();
    if (sub.status === 'Accepted') {
      solvedProblemIds.add(pid);
    } else {
      attemptedProblemIds.add(pid);
    }
  }

  // Remove solved from attempted (attempted = tried but NOT yet solved)
  for (const pid of solvedProblemIds) {
    attemptedProblemIds.delete(pid);
  }

  // Build tag performance from submissions + problems
  for (const sub of submissions) {
    const pid = sub.problemId.toString();
    const problem = allProblems.find(p => p._id.toString() === pid);
    if (problem) {
      for (const tag of problem.tags) {
        if (!tagSubmissions[tag]) tagSubmissions[tag] = { total: 0, accepted: 0 };
        tagSubmissions[tag].total++;
        if (sub.status === 'Accepted') tagSubmissions[tag].accepted++;
      }
    }
  }

  // 3. Compute skill level
  const easy = progress?.problemsSolved?.easy || 0;
  const medium = progress?.problemsSolved?.medium || 0;
  const hard = progress?.problemsSolved?.hard || 0;
  const totalSolved = easy + medium + hard;

  // Determine target difficulty
  let targetDifficulties: string[];
  if (totalSolved < 5) {
    targetDifficulties = ['Beginner', 'Intermediate'];
  } else if (totalSolved < 15) {
    targetDifficulties = ['Intermediate', 'Beginner', 'Advanced'];
  } else {
    targetDifficulties = ['Advanced', 'Intermediate'];
  }

  // 4. Identify weak tags (acceptance rate < 50%) and fresh tags
  const weakTags = new Set<string>();
  const exploredTags = new Set<string>(Object.keys(tagSubmissions));
  for (const [tag, stats] of Object.entries(tagSubmissions)) {
    const rate = stats.total > 0 ? stats.accepted / stats.total : 0;
    if (rate < 0.5 && stats.total >= 1) weakTags.add(tag);
  }

  // All unique tags from all problems
  const allTags = new Set<string>();
  for (const p of allProblems) {
    for (const tag of p.tags) allTags.add(tag);
  }
  const freshTags = new Set<string>([...allTags].filter(t => !exploredTags.has(t)));

  // 5. Aptitude weak categories
  const categoryScores: Record<string, { total: number; sum: number }> = {};
  for (const attempt of attempts) {
    const category = (attempt.testId as any)?.category;
    if (category) {
      if (!categoryScores[category]) categoryScores[category] = { total: 0, sum: 0 };
      categoryScores[category].total++;
      categoryScores[category].sum += attempt.score;
    }
  }
  const weakAptitudeCategories = Object.entries(categoryScores)
    .filter(([, stats]) => stats.total > 0 && (stats.sum / stats.total) < 60)
    .map(([cat]) => cat);

  // 6. Score each unsolved problem
  type ScoredProblem = {
    _id: string;
    slug: string;
    title: string;
    difficulty: string;
    tags: string[];
    score: number;
    reason: string;
    category: 'retry' | 'weak-area' | 'progression' | 'explore' | 'popular';
  };

  const scoredProblems: ScoredProblem[] = [];

  for (const problem of allProblems) {
    const pid = problem._id.toString();
    
    // Skip already solved
    if (solvedProblemIds.has(pid)) continue;

    let score = 0;
    let reason = '';
    let category: ScoredProblem['category'] = 'explore';

    // Signal 1: Retry-worthy (attempted but not solved) — highest priority
    if (attemptedProblemIds.has(pid)) {
      score += 50;
      reason = '🔄 You attempted this but haven\'t solved it yet — try again!';
      category = 'retry';
    }

    // Signal 2: Matches weak tags
    const matchedWeakTags = problem.tags.filter(t => weakTags.has(t));
    if (matchedWeakTags.length > 0) {
      score += 30 * matchedWeakTags.length;
      if (!reason) {
        reason = `💪 Practice your weak area: ${matchedWeakTags.join(', ')}`;
        category = 'weak-area';
      }
    }

    // Signal 3: Matches target difficulty
    const difficultyIdx = targetDifficulties.indexOf(problem.difficulty);
    if (difficultyIdx !== -1) {
      score += 20 - (difficultyIdx * 5); // Higher score for primary target difficulty
      if (!reason) {
        if (totalSolved < 5) reason = '🌱 Great for building your foundation';
        else if (totalSolved < 15) reason = '📈 Perfect challenge for your level';
        else reason = '🔥 Push your limits with this one';
        category = 'progression';
      }
    }

    // Signal 4: Fresh tags (exploration)
    const matchedFreshTags = problem.tags.filter(t => freshTags.has(t));
    if (matchedFreshTags.length > 0) {
      score += 15 * matchedFreshTags.length;
      if (!reason) {
        reason = `📚 Explore new topic: ${matchedFreshTags.join(', ')}`;
        category = 'explore';
      }
    }

    // Signal 5: Base score for unsolved (ensures all unsolved problems have some score)
    if (score === 0) {
      score = 5;
      reason = '✨ Try something new';
      category = 'explore';
    }

    scoredProblems.push({
      _id: pid,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      score,
      reason,
      category,
    });
  }

  // Sort by score descending, take top 15
  scoredProblems.sort((a, b) => b.score - a.score);
  const recommendations = scoredProblems.slice(0, 15);

  // 7. Build aptitude recommendations
  const aptitudeTests = await AptitudeTest.find().select('title category').lean();
  const attemptedTestIds = new Set(attempts.map(a => (a.testId as any)?._id?.toString() || a.testId?.toString()));
  
  const aptitudeRecommendations = aptitudeTests
    .filter(t => !attemptedTestIds.has(t._id.toString()))
    .map(t => ({
      _id: t._id,
      title: t.title,
      category: t.category,
      reason: weakAptitudeCategories.includes(t.category)
        ? `💪 Strengthen your ${t.category} skills`
        : '📝 Haven\'t attempted yet',
    }))
    .slice(0, 5);

  // 8. Build summary stats for the UI
  const summary = {
    totalSolved,
    totalAttempted: attemptedProblemIds.size,
    totalProblems: allProblems.length,
    skillLevel: totalSolved < 5 ? 'Beginner' : totalSolved < 15 ? 'Intermediate' : 'Advanced',
    weakTags: [...weakTags].slice(0, 5),
    strongTags: Object.entries(tagSubmissions)
      .filter(([, s]) => s.total >= 2 && (s.accepted / s.total) >= 0.7)
      .map(([tag]) => tag)
      .slice(0, 5),
    weakAptitudeCategories,
    aptitudeTestsTaken: attempts.length,
  };

  res.json({
    success: true,
    data: {
      problems: recommendations,
      aptitudeTests: aptitudeRecommendations,
      summary,
    },
  });
});
