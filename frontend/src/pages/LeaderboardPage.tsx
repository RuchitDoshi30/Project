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
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200">
          <Crown className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-bold text-yellow-700">1st</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-300">
          <Medal className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">2nd</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200">
          <Medal className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-bold text-orange-700">3rd</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-200">
        <span className="text-sm font-bold text-gray-700">{rank}</span>
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
          <Card className="border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{currentUserRank.rank}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Your Current Rank</h3>
                  <p className="text-sm text-gray-600">{currentUserRank.enrollmentNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{currentUserRank.score}</div>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Problems</p>
                <p className="text-lg font-bold text-blue-600">{currentUserRank.problemsSolved}</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Tests</p>
                <p className="text-lg font-bold text-purple-600">{currentUserRank.testsCompleted}</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Streak</p>
                <p className="text-lg font-bold text-orange-600">{currentUserRank.streak}</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Badges</p>
                <p className="text-lg font-bold text-green-600">{currentUserRank.badges}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex gap-2">
                {(['overall', 'coding', 'aptitude'] as LeaderboardCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
                      category === cat
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="flex gap-2">
                {(['all-time', 'monthly', 'weekly'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      timePeriod === period
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
              'from-gray-100 to-gray-200 border-gray-300',
              'from-yellow-100 to-yellow-200 border-yellow-300',
              'from-orange-100 to-orange-200 border-orange-300'
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
                  <h3 className="font-bold text-gray-900 mb-1">{actualEntry.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{actualEntry.enrollmentNumber}</p>
                  <div className="text-2xl font-bold text-gray-900">{actualEntry.score}</div>
                  <p className="text-xs text-gray-600">points</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Problems</p>
                    <p className="text-sm font-bold text-blue-600">{actualEntry.problemsSolved}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Tests</p>
                    <p className="text-sm font-bold text-purple-600">{actualEntry.testsCompleted}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Rest of Leaderboard */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">All Rankings</h2>
          </div>

          <div className="space-y-2">
            {topPerformers.slice(3).map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankBadge(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{entry.name}</h3>
                  <p className="text-sm text-gray-600">{entry.enrollmentNumber}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Problems</p>
                    <p className="text-sm font-bold text-blue-600">{entry.problemsSolved}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Tests</p>
                    <p className="text-sm font-bold text-purple-600">{entry.testsCompleted}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Streak</p>
                    <p className="text-sm font-bold text-orange-600">{entry.streak}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Badges</p>
                    <div className="flex items-center justify-center gap-1">
                      <Award className="w-3 h-3 text-green-600" />
                      <p className="text-sm font-bold text-green-600">{entry.badges}</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gray-900">{entry.score}</div>
                  <p className="text-xs text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievement Badges Info */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Keep Climbing!</h3>
              <p className="text-sm text-gray-700">
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
