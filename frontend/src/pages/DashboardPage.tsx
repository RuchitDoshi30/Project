import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Container, PageHeader, Card, SkeletonDashboard, LoadingState } from '../components';
import { Code2, Trophy, Target, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight, AlertCircle, Play, Zap, Timer } from 'lucide-react';
import { fetchUserProgress, fetchRecentActivity, calculateSuccessRate, fetchRecommendations } from '../services/dashboard.service';
import type { IUserProgress } from '../types/models';
import type { RecentActivity, RecommendedProblem } from '../services/dashboard.service';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<IUserProgress | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<RecommendedProblem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, activityData] = await Promise.all([
          fetchUserProgress(),
          fetchRecentActivity(),
        ]);
        setProgress(progressData);
        setRecentActivity(activityData);

        // Fetch smart recommendations from backend
        try {
          const recs = await fetchRecommendations();
          setRecommendedProblems(recs.problems.slice(0, 5));
        } catch {
          setRecommendedProblems([]);
        }
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (!progress) {
    return (
      <Container size="xl" fullHeight>
        <LoadingState isLoading={isLoading} skeleton={<SkeletonDashboard />}>
          <div />
        </LoadingState>
      </Container>
    );
  }

  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  const successRate = calculateSuccessRate(progress);

  const stats = [
    {
      label: 'Problems Solved',
      value: totalSolved.toString(),
      icon: Code2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      subtext: `${progress.problemsSolved.easy}B / ${progress.problemsSolved.medium}I / ${progress.problemsSolved.hard}A`,
    },
    {
      label: 'Tests Completed',
      value: progress.aptitudeTestsTaken.toString(),
      icon: Trophy,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      subtext: 'Aptitude tests',
    },
    {
      label: 'Total Submissions',
      value: progress.totalSubmissions.toString(),
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      subtext: 'All attempts',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      subtext: 'Acceptance rate',
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'attempted':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return CheckCircle2;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'badge-easy';
      case 'Intermediate':
        return 'badge-medium';
      case 'Advanced':
        return 'badge-hard';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Container size="xl" fullHeight>
      <LoadingState isLoading={isLoading} skeleton={<SkeletonDashboard />}>
        <PageHeader
          title="Dashboard"
          description="Track your progress and continue learning"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-2xl font-bold text-gray-900 dark:text-lc-text">{stat.value}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-lc-text-muted">{stat.subtext}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Continue Learning CTA */}
        {totalSolved < 100 && (
          <Card className="p-5 mb-6 border-l-4 border-primary-600 dark:border-accent-500">
            <div className="flex items-start gap-4">
              <div className="bg-primary-600 dark:bg-accent-500 p-2.5 rounded-lg flex-shrink-0">
                <Zap className="w-5 h-5 text-white dark:text-lc-bg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-lc-text">Continue Learning</h3>
                  {totalSolved === 0 && (
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded">Get Started</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted mb-3">
                  {totalSolved === 0
                    ? 'Begin your placement preparation journey'
                    : `You've solved ${totalSolved} problems. Keep going!`}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/coding"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-accent-500/15 dark:hover:bg-accent-500/25 text-white dark:text-accent-400 dark:border dark:border-accent-500/30 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {totalSolved === 0 ? 'Start Coding' : 'Solve Problems'}
                  </a>
                  <a
                    href="/aptitude"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500/15 dark:hover:bg-green-500/25 text-white dark:text-green-400 dark:border dark:border-green-500/30 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    Take Aptitude Test
                  </a>
                  <span className="text-xs text-gray-500 dark:text-lc-text-muted flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    ~15 min per problem
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Overall Progress */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Overall Progress</h3>
            <span className="text-xs text-gray-500 dark:text-lc-text-muted">{totalSolved}/100 problems</span>
          </div>
          <div className="space-y-4">
            {/* Stacked Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-lc-elevated rounded-full h-2.5 flex overflow-hidden">
              <div
                className="bg-green-500 h-2.5 transition-all duration-300"
                style={{ width: `${(progress.problemsSolved.easy / 100) * 100}%` }}
                title={`Easy: ${progress.problemsSolved.easy}`}
              />
              <div
                className="bg-orange-400 h-2.5 transition-all duration-300"
                style={{ width: `${(progress.problemsSolved.medium / 100) * 100}%` }}
                title={`Medium: ${progress.problemsSolved.medium}`}
              />
              <div
                className="bg-red-500 h-2.5 transition-all duration-300"
                style={{ width: `${(progress.problemsSolved.hard / 100) * 100}%` }}
                title={`Hard: ${progress.problemsSolved.hard}`}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="text-gray-600 dark:text-lc-text-muted">Beginner</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                  <span className="text-gray-600 dark:text-lc-text-muted">Intermediate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-gray-600 dark:text-lc-text-muted">Advanced</span>
                </div>
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-lc-border">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Beginner</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.problemsSolved.easy}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Intermediate</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{progress.problemsSolved.medium}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Advanced</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{progress.problemsSolved.hard}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity & Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Recent Activity</h3>
              <a href="/progress" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">View All</a>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No activity yet. Start solving problems!</p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-colors"
                    >
                      <div className={`${activity.type === 'coding' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30'} p-2 rounded flex-shrink-0`}>
                        {activity.type === 'coding' ? (
                          <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-lc-text truncate">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusIcon className={`w-3 h-3 ${getStatusColor(activity.status)}`} />
                          <span className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                          {activity.score !== undefined && (
                            <span className="text-xs text-gray-400 dark:text-lc-text-muted">• {activity.score}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-lc-text-muted flex-shrink-0">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Recommended */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Recommended for You</h3>
              <a href="/recommended" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">View All</a>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {recommendedProblems.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No problems available yet.</p>
                </div>
              ) : (
                recommendedProblems.map((item) => (
                  <a
                    key={item._id}
                    href={`/coding/${item.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-colors group"
                  >
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded flex-shrink-0">
                      <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-lc-text truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {item.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty}
                          </span>
                        )}
                        {item.tags?.[0] && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted">
                            {item.tags[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">{item.reason}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-lc-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </a>
                ))
              )}
            </div>
          </Card>
        </div>
      </LoadingState>
    </Container>
  );
};

export default DashboardPage;
