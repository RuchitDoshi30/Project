import { useState, useEffect } from 'react';
import { Container, PageHeader, Card, SkeletonDashboard, LoadingState } from '../components';
import { Code2, Trophy, Target, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight, AlertCircle, TrendingDown, Minus, Play, Zap, Timer } from 'lucide-react';
import { 
  mockUserProgress, 
  mockRecentActivity, 
  mockUpcomingItems, 
  calculateSuccessRate,
  previousWeekStats,
  mockTopicProgress,
  mockTimeInvestment,
  mockNextActions
} from '../services/dashboard.service';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const progress = mockUserProgress;
  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  // const overallProgress = calculateProgress(progress); // Reserved for future use
  const successRate = calculateSuccessRate(progress);
  
  // Calculate trends
  const problemsTrend = totalSolved - previousWeekStats.problemsSolved;
  const successRateTrend = successRate - previousWeekStats.successRate;
  const testsTrend = progress.aptitudeTestsTaken - previousWeekStats.testsCompleted;

  // Format time
  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const stats = [
    {
      label: 'Problems Solved',
      value: totalSolved.toString(),
      icon: Code2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtext: `${progress.problemsSolved.easy}E / ${progress.problemsSolved.medium}M / ${progress.problemsSolved.hard}H`,
      trend: problemsTrend,
    },
    {
      label: 'Tests Completed',
      value: progress.aptitudeTestsTaken.toString(),
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtext: 'Aptitude tests',
      trend: testsTrend,
    },
    {
      label: 'Total Submissions',
      value: progress.totalSubmissions.toString(),
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtext: 'All attempts',
      trend: null,
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtext: 'Acceptance rate',
      trend: successRateTrend,
    },
  ];

  const getTrendIcon = (trend: number | null) => {
    if (trend === null || trend === 0) return Minus;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: number | null) => {
    if (trend === null || trend === 0) return 'text-gray-400';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

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
      
      {/* Compact Stats Grid with Trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend);
          return (
            <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend !== null && stat.trend !== 0 && (
                      <div className={`flex items-center gap-0.5 ${getTrendColor(stat.trend)}`}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{Math.abs(stat.trend)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{stat.subtext}</p>
                </div>
                <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next Action - Clean & Minimal */}
      {mockNextActions.length > 0 && (
        <Card className="p-5 mb-6 border-l-4 border-primary-600">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 p-2.5 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900">Continue Learning</h3>
                {mockNextActions[0].priority === 'high' && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">High Priority</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{mockNextActions[0].description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={mockNextActions[0].actionUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {mockNextActions[0].title}
                </a>
                {mockNextActions[0].difficulty && (
                  <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                    mockNextActions[0].difficulty === 'Beginner' ? 'bg-green-50 text-green-700' :
                    mockNextActions[0].difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {mockNextActions[0].difficulty}
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  ~{mockNextActions[0].estimatedTime} min
                </span>
              </div>
              {mockNextActions[0].reason && (
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  {mockNextActions[0].reason}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Progress & Time Investment Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Overall Progress */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-xs text-gray-500">{totalSolved}/100 problems</span>
          </div>
          <div className="space-y-4">
            {/* Stacked Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
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
                  <span className="text-gray-600">Easy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                  <span className="text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-gray-600">Hard</span>
                </div>
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Easy</p>
                <p className="text-2xl font-bold text-green-600">{progress.problemsSolved.easy}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Medium</p>
                <p className="text-2xl font-bold text-orange-600">{progress.problemsSolved.medium}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Hard</p>
                <p className="text-2xl font-bold text-red-600">{progress.problemsSolved.hard}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Investment */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Time Investment</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-gray-900">{formatMinutes(mockTimeInvestment.today)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">This Week</p>
                <p className="text-base font-semibold text-gray-900">{formatMinutes(mockTimeInvestment.thisWeek)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {mockTimeInvestment.thisWeek > mockTimeInvestment.lastWeek ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">+{formatMinutes(mockTimeInvestment.thisWeek - mockTimeInvestment.lastWeek)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600">-{formatMinutes(mockTimeInvestment.lastWeek - mockTimeInvestment.thisWeek)}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Daily Avg</p>
                <p className="text-base font-semibold text-gray-900">{formatMinutes(mockTimeInvestment.averagePerDay)}</p>
                <p className="text-xs text-gray-400 mt-1">Per day</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Topic Breakdown - Minimal & Clean */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Topic Breakdown</h3>
          <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All</a>
        </div>
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {mockTopicProgress.map((topic) => (
            <div key={topic.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{topic.name}</span>
                    {topic.needsAttention && (
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{topic.solved}/{topic.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        topic.percentage >= 60 ? 'bg-green-500' : 
                        topic.percentage >= 40 ? 'bg-orange-400' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-10 text-right ${
                    topic.percentage >= 60 ? 'text-green-600' : 
                    topic.percentage >= 40 ? 'text-orange-600' : 
                    'text-red-600'
                  }`}>{topic.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity & Recommended - Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All</a>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {mockRecentActivity.map((activity) => {
              const StatusIcon = getStatusIcon(activity.status);
              return (
                <div 
                  key={activity.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`${activity.type === 'coding' ? 'bg-blue-50' : 'bg-green-50'} p-2 rounded flex-shrink-0`}>
                    {activity.type === 'coding' ? (
                      <Code2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Trophy className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusIcon className={`w-3 h-3 ${getStatusColor(activity.status)}`} />
                      <span className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      {activity.score && (
                        <span className="text-xs text-gray-400">• {activity.score}%</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatTimestamp(activity.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recommended */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recommended for You</h3>
            <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All</a>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {mockUpcomingItems.map((item) => (
              <a 
                key={item.id}
                href="#"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className={`${item.type === 'coding' ? 'bg-blue-50' : 'bg-green-50'} p-2 rounded flex-shrink-0`}>
                  {item.type === 'coding' ? (
                    <Code2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Trophy className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {item.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">• {item.estimatedTime}m</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>
        </Card>
      </div>
      </LoadingState>
    </Container>
  );
};

export default DashboardPage;
