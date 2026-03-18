import { useState, useEffect } from 'react';
import { Container, PageHeader, Card } from '../components';
import { 
  Brain, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  TrendingUp,
  Award
} from 'lucide-react';
import { getUserAttempts } from '../services/aptitude.service';
import type { IAptitudeAttempt } from '../types/models';

const TestResultsHistoryPage = () => {
  const [attempts, setAttempts] = useState<IAptitudeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserAttempts();
        setAttempts(data);
      } catch (e) {
        console.error('Failed to load attempts', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    const title = (attempt as any).testId?.title || (attempt as any).testTitle || '';
    const category = (attempt as any).testId?.category || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchesResult =
      resultFilter === 'all' ||
      (resultFilter === 'passed' && attempt.passed) ||
      (resultFilter === 'failed' && !attempt.passed);
    return matchesSearch && matchesCategory && matchesResult;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = {
    total: attempts.length,
    passed: attempts.filter(a => a.passed).length,
    failed: attempts.filter(a => !a.passed).length,
    avgScore: attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
  };

  if (loading) {
    return (
      <Container>
        <PageHeader title="Test Results History" description="Review your aptitude test attempts and learn from your mistakes" />
        <div className="space-y-3">{[1,2,3].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-16 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Test Results History" description="Review your aptitude test attempts and learn from your mistakes" />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Total Attempts</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.total}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Tests taken</p></div>
            <div className="bg-purple-50 dark:bg-purple-900/40 p-2.5 rounded-lg"><Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Passed</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.passed}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Tests cleared</p></div>
            <div className="bg-green-50 dark:bg-green-900/40 p-2.5 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Failed</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.failed}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Need retry</p></div>
            <div className="bg-red-50 dark:bg-red-900/40 p-2.5 rounded-lg"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Average Score</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.avgScore}%</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Overall performance</p></div>
            <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-lg"><Award className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by test name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg">
              <option value="all">All Categories</option>
              <option value="Quantitative">Quantitative</option>
              <option value="Logical">Logical</option>
              <option value="Verbal">Verbal</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
          <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg">
            <option value="all">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </Card>

      {/* Attempts List */}
      <div className="space-y-3">
        {filteredAttempts.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No test attempts found</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Try adjusting your filters or take a test!</p>
          </Card>
        ) : (
          filteredAttempts.map((attempt) => {
            const testTitle = (attempt as any).testId?.title || 'Aptitude Test';
            const testCategory = (attempt as any).testId?.category || 'General';
            const totalQuestions = attempt.answers?.length || 0;
            const correctAnswers = Math.round((attempt.score / 100) * totalQuestions);
            const timeSpent = (attempt as any).timeSpent || 0;

            return (
              <Card key={attempt._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {attempt.passed ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                        <h3 className="text-base font-bold text-gray-900 dark:text-lc-text">{testTitle}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          testCategory === 'Quantitative' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' :
                          testCategory === 'Logical' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' :
                          testCategory === 'Verbal' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' :
                          'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                        }`}>{testCategory}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-lc-text-muted">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(attempt.completedAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium border ${attempt.passed ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'}`}>{attempt.passed ? 'PASSED' : 'FAILED'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold mb-1 ${attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{attempt.score}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 border border-blue-200 dark:border-lc-border">
                      <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Correct</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{correctAnswers}/{totalQuestions}</p>
                    </div>
                    <div className="text-center bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2 border border-purple-200 dark:border-lc-border">
                      <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Score</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{attempt.score}%</p>
                    </div>
                    <div className="text-center bg-green-50 dark:bg-green-900/30 rounded-lg p-2 border border-green-200 dark:border-lc-border">
                      <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Time</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{timeSpent > 0 ? formatTime(timeSpent) : 'N/A'}</p>
                    </div>
                  </div>

                  {attempt.answers && attempt.answers.length > 0 && (
                    <button onClick={() => setExpandedAttempt(expandedAttempt === attempt._id ? null : attempt._id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-all">
                      <Eye className="w-4 h-4" />
                      {expandedAttempt === attempt._id ? 'Hide Details' : 'View Details'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedAttempt === attempt._id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  {expandedAttempt === attempt._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-lc-border">
                      <p className="text-sm text-gray-600 dark:text-lc-text-muted">{attempt.answers.length} questions answered</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {filteredAttempts.length > 1 && (
        <Card className="mt-6 p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2"><TrendingUp className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" /></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Performance Trend</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-lc-text-secondary">
            Your average score is {stats.avgScore}%. {stats.avgScore >= 75 ? 'Great work! Keep it up!' : 'Keep practicing to improve your weak areas!'}
          </p>
        </Card>
      )}
    </Container>
  );
};

export default TestResultsHistoryPage;
