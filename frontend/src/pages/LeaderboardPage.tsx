import { useState, useEffect } from 'react';
import { Container, PageHeader, Card } from '../components';
import { Trophy, Award, Medal, Star, Search, Code2, Brain, TrendingUp } from 'lucide-react';
import { api } from '../services/api.client';

interface LeaderboardEntry {
  rank: number;
  name: string;
  studentId: string;
  score: number;
  problemsSolved: number;
  testsCompleted: number;
  successRate: number;
}

const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'overall' | 'coding' | 'aptitude'>('overall');

  useEffect(() => {
    const load = async () => {
      try {
        // Try fetching leaderboard from dedicated endpoint, otherwise derive from admin students
        let leaderboardData: LeaderboardEntry[] = [];
        try {
          const response = await api.get<{ success: boolean; data: any[] }>('/dashboard/leaderboard');
          leaderboardData = response.data.map((entry: any, index: number) => ({
            rank: index + 1,
            name: entry.name || 'Unknown',
            studentId: entry.universityId || entry.studentId || '',
            score: entry.totalScore || 0,
            problemsSolved: entry.problemsSolved || 0,
            testsCompleted: entry.testsCompleted || 0,
            successRate: entry.successRate || 0,
          }));
        } catch {
          // Fallback: fetch students from admin endpoint  
          try {
            const studentsResponse = await api.get<{ success: boolean; data: any[] }>('/dashboard/students');
            leaderboardData = studentsResponse.data
              .map((student: any, index: number) => ({
                rank: index + 1,
                name: student.name || 'Unknown',
                studentId: student.universityId || '',
                score: (student.problemsSolved?.easy || 0) * 10 + (student.problemsSolved?.medium || 0) * 25 + (student.problemsSolved?.hard || 0) * 50 + (student.aptitudeTestsTaken || 0) * 5,
                problemsSolved: (student.problemsSolved?.easy || 0) + (student.problemsSolved?.medium || 0) + (student.problemsSolved?.hard || 0),
                testsCompleted: student.aptitudeTestsTaken || 0,
                successRate: student.totalSubmissions > 0 ? Math.round(((student.problemsSolved?.easy || 0) + (student.problemsSolved?.medium || 0) + (student.problemsSolved?.hard || 0)) / student.totalSubmissions * 100) : 0,
              }))
              .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
              .map((entry: LeaderboardEntry, index: number) => ({ ...entry, rank: index + 1 }));
          } catch {
            // If not admin, create empty leaderboard silently
            leaderboardData = [];
          }
        }
        setEntries(leaderboardData);
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (tab === 'coding') return b.problemsSolved - a.problemsSolved;
    if (tab === 'aptitude') return b.testsCompleted - a.testsCompleted;
    return b.score - a.score;
  }).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-lc-text-muted">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-l-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-l-gray-400 dark:from-gray-800/30 dark:to-slate-800/30 dark:border-l-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-amber-600 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-l-amber-700';
    return '';
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserEntry = sortedEntries.find(e => e.studentId === (currentUser.universityId || ''));

  if (loading) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader title="Leaderboard" description="See how you rank among your peers" />
        <div className="space-y-3">{[1,2,3,4,5].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-12 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container size="xl" fullHeight>
      <PageHeader title="Leaderboard" description="See how you rank among your peers" />

      {/* User's Rank Card */}
      {currentUserEntry && (
        <Card className="mb-6 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">{currentUserEntry.rank}</div>
              <div>
                <h3 className="text-lg font-bold">Your Ranking</h3>
                <p className="text-sm text-blue-200">Score: {currentUserEntry.score} pts • {currentUserEntry.problemsSolved} problems solved</p>
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'overall', label: 'Overall', icon: TrendingUp },
          { key: 'coding', label: 'Coding', icon: Code2 },
          { key: 'aptitude', label: 'Aptitude', icon: Brain },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-blue-600 text-white dark:bg-accent-500/20 dark:text-accent-400 dark:border dark:border-accent-500/30' : 'bg-white dark:bg-lc-card border border-gray-200 dark:border-lc-border-light text-gray-600 dark:text-lc-text-muted hover:bg-gray-50 dark:hover:bg-lc-elevated'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_120px_120px_100px] gap-2 p-3 bg-gray-50 dark:bg-lc-elevated text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">
          <div>Rank</div>
          <div>Student</div>
          <div className="text-center">Score</div>
          <div className="text-center">Problems</div>
          <div className="text-center">Tests</div>
          <div className="text-center">Success %</div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-lc-border max-h-[500px] overflow-y-auto">
          {sortedEntries.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-lc-text-muted">No leaderboard data available yet</p>
            </div>
          ) : (
            sortedEntries.map((entry) => {
              const isCurrentUser = entry.studentId === (currentUser.universityId || '');
              return (
                <div key={entry.studentId || entry.rank} className={`grid grid-cols-[80px_1fr_120px_120px_120px_100px] gap-2 p-3 items-center hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors ${getRankBg(entry.rank)} ${isCurrentUser ? 'ring-2 ring-blue-500 ring-inset' : ''}`}>
                  <div className="flex items-center justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <p className={`text-sm font-semibold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-lc-text'}`}>{entry.name} {isCurrentUser && <span className="text-xs text-blue-500">(You)</span>}</p>
                    <p className="text-xs text-gray-500 dark:text-lc-text-muted">{entry.studentId}</p>
                  </div>
                  <div className="text-center"><span className="text-sm font-bold text-gray-900 dark:text-lc-text">{entry.score}</span></div>
                  <div className="text-center"><span className="text-sm font-medium text-blue-600 dark:text-blue-400">{entry.problemsSolved}</span></div>
                  <div className="text-center"><span className="text-sm font-medium text-purple-600 dark:text-purple-400">{entry.testsCompleted}</span></div>
                  <div className="text-center"><span className={`text-sm font-medium ${entry.successRate >= 70 ? 'text-green-600 dark:text-green-400' : entry.successRate >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{entry.successRate}%</span></div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </Container>
  );
};

export default LeaderboardPage;
