import { Container, PageHeader, Card } from '../components';
import { 
  Users, Code2, FileQuestion, Clock, TrendingUp, Activity, 
  CheckCircle, XCircle, AlertCircle, Eye, Plus, 
  BarChart3, PieChart, Calendar, Award
} from 'lucide-react';
import { 
  getAdminStatistics,
  getRecentSubmissions,
  getRecentStudentActivity,
  getSystemHealth,
  type RecentSubmission,
  type StudentActivity
} from '../services/admin.service';

/**
 * AdminDashboardPage Component
 * 
 * Main admin dashboard displaying:
 * - System statistics (students, problems, submissions)
 * - Recent activity monitoring
 * - Quick action cards for common tasks
 * - System health indicators
 * - Performance metrics
 */
const AdminDashboardPage = () => {
  const statistics = getAdminStatistics();
  const recentSubmissions = getRecentSubmissions(5);
  const recentActivity = getRecentStudentActivity(10);
  const systemHealth = getSystemHealth();

  const statsCards = [
    {
      label: 'Total Students',
      value: statistics.totalStudents.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `+${statistics.newStudentsThisMonth} this month`,
      changeType: 'positive' as const,
      linkText: 'Manage Students',
      linkUrl: '/admin/students',
    },
    {
      label: 'Coding Problems',
      value: statistics.totalProblems.toString(),
      icon: Code2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${statistics.problemsByDifficulty.Beginner}B / ${statistics.problemsByDifficulty.Intermediate}I / ${statistics.problemsByDifficulty.Advanced}A`,
      linkText: 'Manage Problems',
      linkUrl: '/admin/problems',
    },
    {
      label: 'Aptitude Questions',
      value: statistics.totalAptitudeQuestions.toString(),
      icon: FileQuestion,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${statistics.aptitudeByCategory.Quantitative}Q / ${statistics.aptitudeByCategory.Logical}L / ${statistics.aptitudeByCategory.Verbal}V`,
      linkText: 'Manage Questions',
      linkUrl: '/admin/aptitude',
    },
    {
      label: 'Pending Submissions',
      value: statistics.pendingSubmissions.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: statistics.pendingSubmissions > 10 ? 'Needs attention' : 'Under control',
      changeType: statistics.pendingSubmissions > 10 ? 'warning' as const : 'neutral' as const,
      linkText: 'Review Submissions',
      linkUrl: '/admin/submissions',
    },
  ];

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Create new student account',
      icon: Users,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      url: '/admin/students',
    },
    {
      title: 'Add Problem',
      description: 'Create coding problem',
      icon: Code2,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      url: '/admin/problems',
    },
    {
      title: 'Add Question',
      description: 'Create aptitude question',
      icon: FileQuestion,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      url: '/admin/aptitude',
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: BarChart3,
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
      url: '/admin/reports',
    },
  ];

  const getSubmissionStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'rejected':
      case 'wrong answer':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      case 'rejected':
      case 'wrong answer':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="Admin Dashboard"
        description="Manage students, content, and monitor platform activity"
      />

      {/* System Health Banner */}
      {systemHealth.status !== 'healthy' && (
        <Card className="p-4 mb-6 border-l-4 border-orange-500 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-900">System Status: {systemHealth.status}</p>
              <p className="text-xs text-orange-700">{systemHealth.message}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const emojis = ['👨‍🎓', '💻', '🧠', '⏳'];
          const gradients = [
            'from-blue-50 to-indigo-50 border-blue-200',
            'from-purple-50 to-pink-50 border-purple-200',
            'from-green-50 to-emerald-50 border-green-200',
            'from-orange-50 to-red-50 border-orange-200'
          ];
          return (
            <Card key={index} className={`bg-gradient-to-br ${gradients[index]} hover:shadow-xl hover:scale-105 transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{emojis[index]}</span>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'warning' ? 'text-orange-600' :
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl shadow-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <a
                href={stat.linkUrl}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 group"
              >
                {stat.linkText}
                <Eye className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.url}
                className={`${action.color} ${action.hoverColor} text-white p-5 rounded-xl transition-all duration-300 group hover:shadow-xl hover:scale-105`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6" />
                  <Plus className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
                </div>
                <h4 className="text-sm font-bold mb-1">{action.title}</h4>
                <p className="text-xs opacity-90">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Engagement Rate */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-2">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">📊 Engagement Rate</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-semibold">Active Users</span>
                <span className="text-xs font-bold text-green-600">
                  {statistics.activeStudents}/{statistics.totalStudents}
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${(statistics.activeStudents / statistics.totalStudents) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-semibold">Avg. Problems/Student</span>
                <span className="text-sm font-bold text-green-600">{statistics.averageProblemsPerStudent}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Submission Stats */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md p-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">📈 Submission Trends</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">Today</span>
              <span className="text-sm font-bold text-blue-600">{statistics.submissionsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">This Week</span>
              <span className="text-sm font-bold text-blue-600">{statistics.submissionsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">Approval Rate</span>
              <span className="text-sm font-bold text-green-600">{statistics.approvalRate}%</span>
            </div>
          </div>
        </Card>

        {/* Content Stats */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md p-2">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">🎯 Content Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">Arrays & Strings</span>
              <span className="text-sm font-bold text-purple-600">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">DP & Recursion</span>
              <span className="text-sm font-bold text-purple-600">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold">Trees & Graphs</span>
              <span className="text-sm font-bold text-purple-600">40%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Submissions */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Submissions</h3>
            </div>
            <a href="/admin/submissions" className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
              View All →
            </a>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentSubmissions.map((submission: RecentSubmission) => (
              <div
                key={submission.id}
                className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-100 hover:shadow-md"
              >
                {getSubmissionStatusIcon(submission.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{submission.problemTitle}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600 font-medium">{submission.studentName}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className={`text-xs capitalize font-semibold ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 font-medium">{formatTimestamp(submission.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Student Activity */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Student Activity</h3>
            </div>
            <a href="/admin/students" className="text-xs text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all">
              View All →
            </a>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentActivity.map((activity: StudentActivity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={`${
                  activity.type === 'coding' ? 'bg-blue-50' : 
                  activity.type === 'aptitude' ? 'bg-green-50' : 
                  'bg-purple-50'
                } p-2 rounded`}>
                  {activity.type === 'coding' ? (
                    <Code2 className="w-4 h-4 text-blue-600" />
                  ) : activity.type === 'aptitude' ? (
                    <FileQuestion className="w-4 h-4 text-green-600" />
                  ) : (
                    <Award className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.studentName}</p>
                  <p className="text-xs text-gray-600 truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatTimestamp(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="p-5 mt-4 border-l-4 border-primary-600">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Upcoming Tasks</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Review {statistics.pendingSubmissions} pending submissions</li>
              <li>• Add {5 - (statistics.totalProblems % 5)} more problems to reach next milestone</li>
              <li>• Check inactive students ({statistics.totalStudents - statistics.activeStudents} students)</li>
            </ul>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default AdminDashboardPage;
