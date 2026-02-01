import { useState } from 'react';
import { Container, PageHeader, Card } from '../components';
import { 
  Code2, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronDown
} from 'lucide-react';

/**
 * Submission History Page
 * 
 * View all code submissions with:
 * - Filters (date, problem, status, language)
 * - Detailed view of each submission
 * - Code preview
 * - Test results
 * - Execution time
 */

interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  status: 'accepted' | 'wrong-answer' | 'runtime-error' | 'time-limit';
  submittedAt: string;
  executionTime: number; // ms
  memoryUsed: number; // MB
  testsPassed: number;
  totalTests: number;
  code: string;
}

// Mock data
const mockSubmissions: Submission[] = [
  {
    id: '1',
    problemId: 'p1',
    problemTitle: 'Two Sum',
    problemDifficulty: 'Beginner',
    language: 'JavaScript',
    status: 'accepted',
    submittedAt: '2026-02-01T10:30:00Z',
    executionTime: 45,
    memoryUsed: 12.5,
    testsPassed: 10,
    totalTests: 10,
    code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    id: '2',
    problemId: 'p2',
    problemTitle: 'Binary Search',
    problemDifficulty: 'Beginner',
    language: 'Python',
    status: 'accepted',
    submittedAt: '2026-01-31T15:45:00Z',
    executionTime: 32,
    memoryUsed: 10.2,
    testsPassed: 8,
    totalTests: 8,
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  {
    id: '3',
    problemId: 'p3',
    problemTitle: 'Merge Sort',
    problemDifficulty: 'Intermediate',
    language: 'C++',
    status: 'wrong-answer',
    submittedAt: '2026-01-30T09:15:00Z',
    executionTime: 120,
    memoryUsed: 15.8,
    testsPassed: 6,
    totalTests: 10,
    code: `void merge(vector<int>& arr, int l, int m, int r) {
    // Implementation
}`,
  },
  {
    id: '4',
    problemId: 'p4',
    problemTitle: 'Longest Palindrome',
    problemDifficulty: 'Advanced',
    language: 'Java',
    status: 'time-limit',
    submittedAt: '2026-01-29T14:20:00Z',
    executionTime: 2500,
    memoryUsed: 25.4,
    testsPassed: 8,
    totalTests: 12,
    code: `public String longestPalindrome(String s) {
    // Implementation
}`,
  },
  {
    id: '5',
    problemId: 'p1',
    problemTitle: 'Two Sum',
    problemDifficulty: 'Beginner',
    language: 'JavaScript',
    status: 'wrong-answer',
    submittedAt: '2026-01-28T11:00:00Z',
    executionTime: 38,
    memoryUsed: 11.2,
    testsPassed: 7,
    totalTests: 10,
    code: `function twoSum(nums, target) {
  // First attempt - failed
}`,
  },
];

const SubmissionHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  const languages = Array.from(new Set(mockSubmissions.map(s => s.language)));

  const filteredSubmissions = mockSubmissions.filter(submission => {
    const matchesSearch = submission.problemTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || submission.language === languageFilter;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

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

  const handleDownload = (submission: Submission) => {
    const blob = new Blob([submission.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submission.problemTitle.replace(/\s+/g, '_')}_${submission.id}.${
      submission.language === 'JavaScript' ? 'js' :
      submission.language === 'Python' ? 'py' :
      submission.language === 'Java' ? 'java' :
      submission.language === 'C++' ? 'cpp' : 'txt'
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: mockSubmissions.length,
    accepted: mockSubmissions.filter(s => s.status === 'accepted').length,
    failed: mockSubmissions.filter(s => s.status !== 'accepted').length,
    acceptanceRate: Math.round((mockSubmissions.filter(s => s.status === 'accepted').length / mockSubmissions.length) * 100),
  };

  return (
    <Container>
      <PageHeader
        title="Submission History"
        description="View and analyze all your code submissions"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-400">All attempts</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Accepted</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.accepted}</p>
              <p className="text-xs text-gray-400">Success</p>
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
              <p className="text-xs text-gray-400">Attempts</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Acceptance Rate</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.acceptanceRate}%</p>
              <p className="text-xs text-gray-400">Success rate</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
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
              placeholder="Search by problem name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="wrong-answer">Wrong Answer</option>
              <option value="runtime-error">Runtime Error</option>
              <option value="time-limit">Time Limit</option>
            </select>
          </div>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card className="p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No submissions found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <h3 className="text-base font-bold text-gray-900">{submission.problemTitle}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        submission.problemDifficulty === 'Beginner' ? 'bg-green-100 text-green-700 border-green-200' :
                        submission.problemDifficulty === 'Intermediate' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {submission.problemDifficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(submission.submittedAt)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-medium border ${
                        submission.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                        submission.status === 'wrong-answer' ? 'bg-red-100 text-red-700 border-red-200' :
                        submission.status === 'runtime-error' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {submission.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold border border-gray-200">
                        {submission.language}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedSubmission === submission.id ? 'Hide' : 'View'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSubmission === submission.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Tests Passed</p>
                    <p className="text-sm font-bold text-blue-600">{submission.testsPassed}/{submission.totalTests}</p>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Runtime</p>
                    <p className="text-sm font-bold text-purple-600">{submission.executionTime}ms</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Memory</p>
                    <p className="text-sm font-bold text-green-600">{submission.memoryUsed}MB</p>
                  </div>
                </div>

                {/* Expanded View */}
                {expandedSubmission === submission.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">Submitted Code</h4>
                      <button
                        onClick={() => handleDownload(submission)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{submission.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default SubmissionHistoryPage;
