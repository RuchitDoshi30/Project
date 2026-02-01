import { useState } from 'react';
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

/**
 * Test Results History Page
 * 
 * View all aptitude test attempts with:
 * - Filters (category, pass/fail, date)
 * - Detailed question-by-question review
 * - Score trends
 * - Time analysis
 * - Comparison between attempts
 */

interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  category: 'Quantitative' | 'Logical' | 'Verbal' | 'Technical';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingPercentage: number;
  completedAt: string;
  timeSpent: number; // seconds
  questions: QuestionResult[];
}

interface QuestionResult {
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

// Mock data
const mockAttempts: TestAttempt[] = [
  {
    id: '1',
    testId: 't1',
    testTitle: 'Advanced Quantitative Reasoning',
    category: 'Quantitative',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    passed: true,
    passingPercentage: 70,
    completedAt: '2026-02-01T14:30:00Z',
    timeSpent: 1200,
    questions: [
      {
        questionText: 'If x + y = 10 and x - y = 2, what is the value of x?',
        yourAnswer: '6',
        correctAnswer: '6',
        isCorrect: true,
        timeSpent: 45,
      },
      {
        questionText: 'What is 15% of 200?',
        yourAnswer: '30',
        correctAnswer: '30',
        isCorrect: true,
        timeSpent: 30,
      },
      {
        questionText: 'Solve: 2x + 5 = 15',
        yourAnswer: '4',
        correctAnswer: '5',
        isCorrect: false,
        timeSpent: 60,
      },
    ],
  },
  {
    id: '2',
    testId: 't2',
    testTitle: 'Logical Reasoning Fundamentals',
    category: 'Logical',
    score: 92,
    totalQuestions: 25,
    correctAnswers: 23,
    passed: true,
    passingPercentage: 70,
    completedAt: '2026-01-30T10:15:00Z',
    timeSpent: 1500,
    questions: [],
  },
  {
    id: '3',
    testId: 't3',
    testTitle: 'Verbal Ability Test',
    category: 'Verbal',
    score: 68,
    totalQuestions: 30,
    correctAnswers: 21,
    passed: false,
    passingPercentage: 70,
    completedAt: '2026-01-28T16:45:00Z',
    timeSpent: 1800,
    questions: [],
  },
  {
    id: '4',
    testId: 't4',
    testTitle: 'Technical Aptitude - Programming',
    category: 'Technical',
    score: 88,
    totalQuestions: 20,
    correctAnswers: 18,
    passed: true,
    passingPercentage: 75,
    completedAt: '2026-01-25T09:30:00Z',
    timeSpent: 1350,
    questions: [],
  },
  {
    id: '5',
    testId: 't1',
    testTitle: 'Advanced Quantitative Reasoning',
    category: 'Quantitative',
    score: 75,
    totalQuestions: 20,
    correctAnswers: 15,
    passed: true,
    passingPercentage: 70,
    completedAt: '2026-01-20T11:00:00Z',
    timeSpent: 1400,
    questions: [],
  },
];

const TestResultsHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  const filteredAttempts = mockAttempts.filter(attempt => {
    const matchesSearch = attempt.testTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || attempt.category === categoryFilter;
    const matchesResult = 
      resultFilter === 'all' || 
      (resultFilter === 'passed' && attempt.passed) ||
      (resultFilter === 'failed' && !attempt.passed);
    return matchesSearch && matchesCategory && matchesResult;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = {
    total: mockAttempts.length,
    passed: mockAttempts.filter(a => a.passed).length,
    failed: mockAttempts.filter(a => a.passed === false).length,
    avgScore: Math.round(mockAttempts.reduce((sum, a) => sum + a.score, 0) / mockAttempts.length),
  };

  return (
    <Container>
      <PageHeader
        title="Test Results History"
        description="Review your aptitude test attempts and learn from your mistakes"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-400">Tests taken</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Passed</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.passed}</p>
              <p className="text-xs text-gray-400">Tests cleared</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Failed</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.failed}</p>
              <p className="text-xs text-gray-400">Need retry</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.avgScore}%</p>
              <p className="text-xs text-gray-400">Overall performance</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by test name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Quantitative">Quantitative</option>
              <option value="Logical">Logical</option>
              <option value="Verbal">Verbal</option>
              <option value="Technical">Technical</option>
            </select>
          </div>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
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
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No test attempts found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </Card>
        ) : (
          filteredAttempts.map((attempt) => (
            <Card key={attempt.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {attempt.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className="text-base font-bold text-gray-900">{attempt.testTitle}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        attempt.category === 'Quantitative' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        attempt.category === 'Logical' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        attempt.category === 'Verbal' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>
                        {attempt.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(attempt.completedAt)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-medium border ${
                        attempt.passed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {attempt.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold mb-1 ${
                      attempt.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.score}%
                    </div>
                    <p className="text-xs text-gray-500">
                      Required: {attempt.passingPercentage}%
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Correct</p>
                    <p className="text-sm font-bold text-blue-600">{attempt.correctAnswers}/{attempt.totalQuestions}</p>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Accuracy</p>
                    <p className="text-sm font-bold text-purple-600">{Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Time</p>
                    <p className="text-sm font-bold text-green-600">{formatTime(attempt.timeSpent)}</p>
                  </div>
                </div>

                {/* Expand Button */}
                {attempt.questions.length > 0 && (
                  <button
                    onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedAttempt === attempt.id ? 'Hide Question Review' : 'View Question Review'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedAttempt === attempt.id ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Expanded View - Question Review */}
                {expandedAttempt === attempt.id && attempt.questions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Question-by-Question Review</h4>
                    <div className="space-y-3">
                      {attempt.questions.map((question, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {question.isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-2">
                                Q{index + 1}. {question.questionText}
                              </p>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-700">Your Answer:</span>
                                  <span className={`font-bold ${
                                    question.isCorrect ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {question.yourAnswer}
                                  </span>
                                </div>
                                {!question.isCorrect && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Correct Answer:</span>
                                    <span className="text-green-600 font-bold">{question.correctAnswer}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Time spent: {question.timeSpent}s</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Score Trend Insight */}
      {filteredAttempts.length > 1 && (
        <Card className="mt-6 p-5 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gray-100 rounded-lg p-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Performance Trend</h3>
          </div>
          <p className="text-sm text-gray-700">
            Your average score has {stats.avgScore >= 75 ? 'been strong' : 'room for improvement'}. 
            Keep practicing to improve your weak areas!
          </p>
        </Card>
      )}
    </Container>
  );
};

export default TestResultsHistoryPage;
