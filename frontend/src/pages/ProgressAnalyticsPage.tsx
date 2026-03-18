import { useState, useEffect } from 'react';
import { Container, PageHeader, Card } from '../components';
import {
  BarChart3,
  TrendingUp,
  Code2,
  Brain,
  Target,
  Award,
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react';
import { fetchUserProgress } from '../services/dashboard.service';
import { getUserAttempts } from '../services/aptitude.service';
import { api } from '../services/api.client';
import type { IUserProgress, IAptitudeAttempt } from '../types/models';

interface AnalyticsData {
  progress: IUserProgress;
  submissions: any[];
  aptitudeAttempts: IAptitudeAttempt[];
}

const ProgressAnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progress, aptitudeAttempts, submissionsRes] = await Promise.all([
          fetchUserProgress(),
          getUserAttempts(),
          api.get<{ success: boolean; data: any[] }>('/submissions/me').catch(() => ({ data: [] })),
        ]);
        setData({ progress, aptitudeAttempts, submissions: submissionsRes.data || [] });
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader title="Progress Analytics" description="Track your learning journey with detailed insights" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-20 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  const { progress, submissions, aptitudeAttempts } = data;
  const totalSolved = (progress.problemsSolved?.easy || 0) + (progress.problemsSolved?.medium || 0) + (progress.problemsSolved?.hard || 0);
  const totalSubmissions = progress.totalSubmissions || submissions.length;
  const successRate = totalSubmissions > 0 ? Math.round((totalSolved / totalSubmissions) * 100) : 0;
  const aptitudePassed = aptitudeAttempts.filter(a => a.passed).length;
  const avgAptitudeScore = aptitudeAttempts.length > 0 ? Math.round(aptitudeAttempts.reduce((sum, a) => sum + a.score, 0) / aptitudeAttempts.length) : 0;

  // Difficulty distribution
  const difficultyData = [
    { label: 'Beginner', count: progress.problemsSolved?.easy || 0, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Intermediate', count: progress.problemsSolved?.medium || 0, color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Advanced', count: progress.problemsSolved?.hard || 0, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
  ];
  const maxDiffCount = Math.max(...difficultyData.map(d => d.count), 1);

  // Aptitude category performance
  const categoryStats: Record<string, { attempted: number; passed: number; avgScore: number }> = {};
  aptitudeAttempts.forEach(attempt => {
    const cat = (attempt as any).testId?.category || 'General';
    if (!categoryStats[cat]) categoryStats[cat] = { attempted: 0, passed: 0, avgScore: 0 };
    categoryStats[cat].attempted++;
    if (attempt.passed) categoryStats[cat].passed++;
    categoryStats[cat].avgScore += attempt.score;
  });
  Object.keys(categoryStats).forEach(cat => {
    if (categoryStats[cat].attempted > 0) {
      categoryStats[cat].avgScore = Math.round(categoryStats[cat].avgScore / categoryStats[cat].attempted);
    }
  });

  // Submission language distribution
  const langDist: Record<string, number> = {};
  submissions.forEach((s: any) => {
    const lang = s.language || 'Unknown';
    langDist[lang] = (langDist[lang] || 0) + 1;
  });
  const langData = Object.entries(langDist).sort((a, b) => b[1] - a[1]);
  const langColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <Container size="xl" fullHeight>
      <PageHeader title="Progress Analytics" description="Track your learning journey with detailed insights" />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700">
          <div className="flex items-start justify-between p-4">
            <div><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Problems Solved</p><p className="text-3xl font-bold text-gray-900 dark:text-lc-text mb-1">{totalSolved}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">of {totalSubmissions} submissions</p></div>
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-xl"><Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
          <div className="flex items-start justify-between p-4">
            <div><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Success Rate</p><p className="text-3xl font-bold text-gray-900 dark:text-lc-text mb-1">{successRate}%</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Accepted rate</p></div>
            <div className="bg-green-100 dark:bg-green-900/40 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
          <div className="flex items-start justify-between p-4">
            <div><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Tests Taken</p><p className="text-3xl font-bold text-gray-900 dark:text-lc-text mb-1">{aptitudeAttempts.length}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">{aptitudePassed} passed</p></div>
            <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-xl"><Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-700">
          <div className="flex items-start justify-between p-4">
            <div><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Avg. Aptitude Score</p><p className="text-3xl font-bold text-gray-900 dark:text-lc-text mb-1">{avgAptitudeScore}%</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Across all tests</p></div>
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2.5 rounded-xl"><Award className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Breakdown */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2"><BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text uppercase tracking-wide">📊 Problems by Difficulty</h3>
          </div>
          <div className="space-y-4">
            {difficultyData.map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary">{label}</span>
                  <span className={`text-sm font-bold ${textColor}`}>{count}</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(count / maxDiffCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Language Distribution */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2"><Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text uppercase tracking-wide">💻 Language Usage</h3>
          </div>
          {langData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-lc-text-muted text-center py-6">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {langData.map(([lang, count], index) => (
                <div key={lang} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${langColors[index % langColors.length]}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary flex-1">{lang}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-lc-text">{count}</span>
                  <span className="text-xs text-gray-400 dark:text-lc-text-muted">({totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aptitude Category Performance */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2"><Target className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text uppercase tracking-wide">🎯 Aptitude by Category</h3>
          </div>
          {Object.keys(categoryStats).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-lc-text-muted text-center py-6">No tests taken yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, stats]) => (
                <div key={cat} className="p-3 bg-gray-50 dark:bg-lc-elevated rounded-lg border border-gray-200 dark:border-lc-border-light">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-lc-text">{cat}</span>
                    <span className={`text-sm font-bold ${stats.avgScore >= 70 ? 'text-green-600 dark:text-green-400' : stats.avgScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{stats.avgScore}%</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-lc-text-muted">
                    <span>{stats.attempted} attempted</span>
                    <span>{stats.passed} passed</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-lc-border-light rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${stats.avgScore >= 70 ? 'bg-green-500' : stats.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stats.avgScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Achievements / Milestones */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2"><Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /></div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text uppercase tracking-wide">🏆 Milestones</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'First Problem Solved', achieved: totalSolved >= 1, icon: '🎯' },
              { label: '5 Problems Solved', achieved: totalSolved >= 5, icon: '⭐' },
              { label: '10 Problems Solved', achieved: totalSolved >= 10, icon: '🔥' },
              { label: '25 Problems Solved', achieved: totalSolved >= 25, icon: '💎' },
              { label: 'First Test Passed', achieved: aptitudePassed >= 1, icon: '🧠' },
              { label: '5 Tests Passed', achieved: aptitudePassed >= 5, icon: '🏅' },
              { label: '80%+ Average Score', achieved: avgAptitudeScore >= 80, icon: '👑' },
            ].map((milestone, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${milestone.achieved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-lc-elevated border-gray-200 dark:border-lc-border-light opacity-60'}`}>
                <span className="text-xl">{milestone.icon}</span>
                <span className={`text-sm font-medium flex-1 ${milestone.achieved ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-lc-text-muted'}`}>{milestone.label}</span>
                {milestone.achieved && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary */}
      <Card className="mt-6 p-5 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-1">Summary</h3>
            <p className="text-sm text-gray-700 dark:text-lc-text-secondary">
              You've solved <strong>{totalSolved}</strong> problems with a <strong>{successRate}%</strong> success rate,
              and completed <strong>{aptitudeAttempts.length}</strong> aptitude tests with an average score of <strong>{avgAptitudeScore}%</strong>.
              {successRate >= 70 ? ' Great performance! Keep pushing for the top!' : ' Keep practicing to improve your scores!'}
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default ProgressAnalyticsPage;
