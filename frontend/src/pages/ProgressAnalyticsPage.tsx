import { useState } from 'react';
import { Container, PageHeader, Card } from '../components';
import {
  TrendingUp,
  Code2,
  Brain,
  Clock,
  Target,
  Trophy,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

/**
 * Progress Analytics Page
 * 
 * Comprehensive analytics dashboard showing:
 * - Performance trends over time
 * - Category-wise breakdown
 * - Strengths and weaknesses
 * - Time analysis
 * - Goal tracking
 */

// Mock data - Replace with actual API calls
const mockAnalytics = {
  overview: {
    totalProblemsSolved: 42,
    totalTestsCompleted: 12,
    averageScore: 78,
    currentStreak: 7,
    longestStreak: 15,
    totalTimeSpent: 2847, // minutes
  },
  codingStats: {
    byDifficulty: {
      Beginner: { solved: 18, total: 30, percentage: 60 },
      Intermediate: { solved: 15, total: 35, percentage: 43 },
      Advanced: { solved: 9, total: 25, percentage: 36 },
    },
    byCategory: [
      { name: 'Arrays & Strings', solved: 12, total: 20, percentage: 60 },
      { name: 'Trees & Graphs', solved: 10, total: 18, percentage: 56 },
      { name: 'Dynamic Programming', solved: 8, total: 15, percentage: 53 },
      { name: 'Sorting & Searching', solved: 7, total: 12, percentage: 58 },
      { name: 'Linked Lists', solved: 5, total: 10, percentage: 50 },
    ],
    recentActivity: [
      { date: '2026-02-01', problems: 3, score: 85 },
      { date: '2026-01-31', problems: 2, score: 90 },
      { date: '2026-01-30', problems: 4, score: 75 },
      { date: '2026-01-29', problems: 2, score: 88 },
      { date: '2026-01-28', problems: 3, score: 82 },
      { date: '2026-01-27', problems: 1, score: 95 },
      { date: '2026-01-26', problems: 0, score: 0 },
    ],
  },
  aptitudeStats: {
    byCategory: {
      Quantitative: { bestScore: 85, attempts: 4, avgScore: 78 },
      Logical: { bestScore: 92, attempts: 3, avgScore: 87 },
      Verbal: { bestScore: 76, attempts: 3, avgScore: 71 },
      Technical: { bestScore: 88, attempts: 2, avgScore: 85 },
    },
    totalTestsPassed: 9,
    totalTestsFailed: 3,
  },
  strengths: ['Trees & Graphs', 'Logical Reasoning', 'Sorting Algorithms'],
  weaknesses: ['Dynamic Programming', 'Verbal Ability', 'Advanced DSA'],
  goals: {
    weeklyTarget: 10,
    weeklyProgress: 7,
    monthlyTarget: 40,
    monthlyProgress: 28,
  },
};

const ProgressAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const { overview, codingStats, aptitudeStats, strengths, weaknesses, goals } = mockAnalytics;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Container>
      <PageHeader
        title="📊 Progress Analytics"
        description="Track your learning journey and identify areas for improvement"
      />

      {/* Time Range Filter */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-lc-border bg-white dark:bg-lc-card p-1">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${timeRange === range
                  ? 'bg-primary-600 text-white shadow-sm dark:bg-accent-500/15 dark:text-accent-400'
                  : 'text-gray-600 dark:text-lc-text-secondary hover:text-gray-900 dark:hover:text-lc-text'
                }`}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{overview.totalProblemsSolved}</p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Coding challenges</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Aptitude Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{aptitudeStats.totalTestsPassed}</p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Tests passed</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/40 p-2.5 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{overview.averageScore}%</p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Acceptance rate</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/40 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Day Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{overview.currentStreak}</p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Consecutive days</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/40 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-2">
              <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Weekly Goal</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-lc-text">{goals.weeklyProgress}</span>
              <span className="text-sm text-gray-600 dark:text-lc-text-muted">/ {goals.weeklyTarget} problems</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${(goals.weeklyProgress / goals.weeklyTarget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-lc-text-muted font-medium">
              {goals.weeklyTarget - goals.weeklyProgress} more to reach your weekly goal!
            </p>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-green-600 dark:border-green-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-2">
              <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Monthly Goal</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-lc-text">{goals.monthlyProgress}</span>
              <span className="text-sm text-gray-600 dark:text-lc-text-muted">/ {goals.monthlyTarget} problems</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${(goals.monthlyProgress / goals.monthlyTarget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-lc-text-muted font-medium">
              {goals.monthlyTarget - goals.monthlyProgress} more to reach your monthly goal!
            </p>
          </div>
        </Card>
      </div>

      {/* Coding Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Difficulty Breakdown */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-2">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Difficulty Progress</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(codingStats.byDifficulty).map(([difficulty, stats]) => (
              <div key={difficulty}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary">
                    {difficulty}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-lc-text">
                    {stats.solved}/{stats.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${difficulty === 'Beginner' ? 'bg-green-600' :
                        difficulty === 'Intermediate' ? 'bg-orange-600' :
                          'bg-red-600'
                      }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Performance */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-2">
              <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Category Breakdown</h3>
          </div>
          <div className="space-y-3">
            {codingStats.byCategory.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-lc-text-secondary">{category.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-lc-text">{category.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-accent-400 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Aptitude Performance */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/40 rounded-lg p-2">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Aptitude Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(aptitudeStats.byCategory).map(([category, stats]) => (
            <div key={category} className={`rounded-lg p-4 border hover:shadow-sm transition-all ${category === 'Quantitative' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' :
                category === 'Logical' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700' :
                  category === 'Verbal' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' :
                    'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700'
              }`}>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">{category}</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.bestScore}%</p>
              <p className="text-xs text-gray-600 dark:text-lc-text-muted">Best Score</p>
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mt-1">{stats.attempts} attempts · Avg: {stats.avgScore}%</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{aptitudeStats.totalTestsPassed}</p>
            <p className="text-xs text-gray-600 dark:text-lc-text-muted font-semibold">✅ Passed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{aptitudeStats.totalTestsFailed}</p>
            <p className="text-xs text-gray-600 dark:text-lc-text-muted font-semibold">❌ Failed</p>
          </div>
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 border-l-4 border-green-600 dark:border-green-400">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-2">
              <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Your Strengths</h3>
          </div>
          <div className="space-y-2">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-lc-border"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-lc-text">{strength}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-orange-600 dark:border-orange-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-orange-50 dark:bg-orange-900/40 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Areas to Improve</h3>
          </div>
          <div className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-lc-elevated rounded-lg border border-gray-200 dark:border-lc-border-light"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-lc-text">{weakness}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Time Analysis */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/40 rounded-lg p-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Time Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-lc-border">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{formatTime(overview.totalTimeSpent)}</p>
            <p className="text-xs font-medium text-gray-600 dark:text-lc-text-muted">Total Time Spent</p>
          </div>
          <div className="text-center bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-lc-border">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{Math.round(overview.totalTimeSpent / overview.totalProblemsSolved)}</p>
            <p className="text-xs font-medium text-gray-600 dark:text-lc-text-muted">Avg Minutes/Problem</p>
          </div>
          <div className="text-center bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-lc-border">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{overview.longestStreak}</p>
            <p className="text-xs font-medium text-gray-600 dark:text-lc-text-muted">Longest Streak</p>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default ProgressAnalyticsPage;
