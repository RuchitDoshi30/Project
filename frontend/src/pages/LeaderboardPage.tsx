import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Code2, Brain, Award, Crown, Star } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';

type LeaderboardCategory = 'overall' | 'coding' | 'aptitude';
type TimePeriod = 'all-time' | 'monthly' | 'weekly';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  enrollmentNumber: string;
  score: number;
  problemsSolved: number;
  testsCompleted: number;
  streak: number;
  badges: number;
  isCurrentUser?: boolean;
}

const LeaderboardPage = () => {
  const [category, setCategory] = useState<LeaderboardCategory>('overall');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');

  // Mock data - replace with API call
  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: '1',
      name: 'Rajesh Kumar',
      enrollmentNumber: 'CS2023001',
      score: 2850,
      problemsSolved: 145,
      testsCompleted: 48,
      streak: 45,
      badges: 12,
    },
    {
      rank: 2,
      userId: '2',
      name: 'Priya Sharma',
      enrollmentNumber: 'CS2023002',
      score: 2720,
      problemsSolved: 138,
      testsCompleted: 45,
      streak: 38,
      badges: 10,
    },
    {
      rank: 3,
      userId: '3',
      name: 'Amit Patel',
      enrollmentNumber: 'CS2023003',
      score: 2650,
      problemsSolved: 132,
      testsCompleted: 43,
      streak: 32,
      badges: 9,
    },
    {
      rank: 4,
      userId: '4',
      name: 'Sneha Reddy',
      enrollmentNumber: 'CS2023004',
      score: 2580,
      problemsSolved: 128,
      testsCompleted: 41,
      streak: 28,
      badges: 8,
    },
    {
      rank: 5,
      userId: '5',
      name: 'Vikram Singh',
      enrollmentNumber: 'CS2023005',
      score: 2510,
      problemsSolved: 125,
      testsCompleted: 40,
      streak: 25,
      badges: 8,
    },
    {
      rank: 12,
      userId: 'current',
      name: 'You',
      enrollmentNumber: 'CS2023012',
      score: 2180,
      problemsSolved: 98,
      testsCompleted: 32,
      streak: 15,
      badges: 5,
      isCurrentUser: true,
    },
  ];

  const currentUserRank = leaderboardData.find(entry => entry.isCurrentUser);
  const topPerformers = leaderboardData.filter(entry => !entry.isCurrentUser);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700">
          <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">1st</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-lc-elevated border border-gray-300 dark:border-lc-border-light">
          <Medal className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
          <span className="text-sm font-bold text-gray-700 dark:text-lc-text-secondary">2nd</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-700">
          <Medal className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">3rd</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-lc-elevated border border-gray-200 dark:border-lc-border-light">
        <span className="text-sm font-bold text-gray-700 dark:text-lc-text-secondary">{rank}</span>
      </div>
    );
  };

  const getCategoryIcon = (cat: LeaderboardCategory) => {
    switch (cat) {
      case 'coding':
        return <Code2 className="w-4 h-4" />;
      case 'aptitude':
        return <Brain className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <Container>
      <PageHeader
        title="Leaderboard"
        description="See how you rank among your peers"
      />

      <div className="space-y-6">
        {/* Your Rank Card */}
        {currentUserRank && (
          <Card className="border border-accent-500/30 dark:border-accent-500/20 bg-accent-500/5 dark:bg-accent-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-500/20 dark:bg-accent-500/15 flex items-center justify-center">
                  <span className="text-accent-600 dark:text-accent-400 font-bold text-lg">{currentUserRank.rank}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-lc-text">Your Current Rank</h3>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">{currentUserRank.enrollmentNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">{currentUserRank.score}</div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Total Points</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-white dark:bg-lc-card rounded-lg p-3 border border-gray-200 dark:border-lc-border">
                <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Problems</p>
                <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{currentUserRank.problemsSolved}</p>
              </div>
              <div className="text-center bg-white dark:bg-lc-card rounded-lg p-3 border border-gray-200 dark:border-lc-border">
                <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Tests</p>
                <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{currentUserRank.testsCompleted}</p>
              </div>
              <div className="text-center bg-white dark:bg-lc-card rounded-lg p-3 border border-gray-200 dark:border-lc-border">
                <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Streak</p>
                <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{currentUserRank.streak}</p>
              </div>
              <div className="text-center bg-white dark:bg-lc-card rounded-lg p-3 border border-gray-200 dark:border-lc-border">
                <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Badges</p>
                <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{currentUserRank.badges}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-lc-text-secondary mb-2">Category</label>
              <div className="flex gap-2">
                {(['overall', 'coding', 'aptitude'] as LeaderboardCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${category === cat
                        ? 'bg-primary-600 text-white border-primary-600 dark:bg-accent-500/15 dark:text-accent-400 dark:border-accent-500/30'
                        : 'bg-white dark:bg-lc-card text-gray-700 dark:text-lc-text-secondary border-gray-300 dark:border-lc-border-light hover:bg-gray-50 dark:hover:bg-lc-elevated'
                      }`}
                  >
                    {getCategoryIcon(cat)}
                    <span className="capitalize">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Period Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-lc-text-secondary mb-2">Time Period</label>
              <div className="flex gap-2">
                {(['all-time', 'monthly', 'weekly'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${timePeriod === period
                        ? 'bg-primary-600 text-white border-primary-600 dark:bg-accent-500/15 dark:text-accent-400 dark:border-accent-500/30'
                        : 'bg-white dark:bg-lc-card text-gray-700 dark:text-lc-text-secondary border-gray-300 dark:border-lc-border-light hover:bg-gray-50 dark:hover:bg-lc-elevated'
                      }`}
                  >
                    {period.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4">
          {topPerformers.slice(0, 3).map((_entry, index) => {
            const heights = ['h-48', 'h-56', 'h-44'];
            const colors = [
              'from-gray-100 dark:from-lc-elevated to-gray-200 dark:to-lc-border-light border-gray-300 dark:border-lc-border-light',
              'from-yellow-100 dark:from-yellow-900/40 to-yellow-200 dark:to-yellow-800/40 border-yellow-300 dark:border-yellow-600',
              'from-orange-100 dark:from-orange-900/40 to-orange-200 dark:to-orange-800/40 border-orange-300 dark:border-orange-600'
            ];
            const order = [1, 0, 2]; // Reorder to show 2nd, 1st, 3rd
            const actualIndex = order[index];
            const actualEntry = topPerformers[actualIndex];

            return (
              <Card
                key={actualEntry.userId}
                className={`${heights[index]} flex flex-col justify-between bg-gradient-to-br ${colors[actualIndex]} border-2`}
              >
                <div className="flex justify-center mb-2">
                  {getRankBadge(actualEntry.rank)}
                </div>
                <div className="text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-900 dark:text-lc-text mb-1">{actualEntry.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-3">{actualEntry.enrollmentNumber}</p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-lc-text">{actualEntry.score}</div>
                  <p className="text-xs text-gray-600 dark:text-lc-text-muted">points</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300 dark:border-lc-border-light">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Problems</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{actualEntry.problemsSolved}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Tests</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{actualEntry.testsCompleted}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Rest of Leaderboard */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-lc-text">All Rankings</h2>
          </div>

          <div className="space-y-2">
            {topPerformers.slice(3).map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-lc-border hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankBadge(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-lc-text truncate">{entry.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">{entry.enrollmentNumber}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Problems</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{entry.problemsSolved}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Tests</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{entry.testsCompleted}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Streak</p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{entry.streak}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-lc-text-muted">Badges</p>
                    <div className="flex items-center justify-center gap-1">
                      <Award className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{entry.badges}</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gray-900 dark:text-accent-400">{entry.score}</div>
                  <p className="text-xs text-gray-600 dark:text-lc-text-muted">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievement Badges Info */}
        <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/10 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-lc-text mb-1">Keep Climbing!</h3>
              <p className="text-sm text-gray-700 dark:text-lc-text-secondary">
                Earn points by solving problems, completing tests, and maintaining your streak.
                Complete achievements to earn badges and boost your ranking!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default LeaderboardPage;
