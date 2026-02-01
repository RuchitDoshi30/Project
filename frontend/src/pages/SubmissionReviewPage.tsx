import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Code, User, Calendar, Filter } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';

/**
 * Submission Review Page
 * 
 * Interface for reviewing and managing student code submissions.
 * Features: View code, test cases, approve/reject, feedback.
 */

// Submission Interface
interface Submission {
  id: string;
  problemTitle: string;
  problemSlug: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Wrong Answer';
  language: string;
  code: string;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime?: string;
  memoryUsed?: string;
}

// Mock Submissions Data
const mockSubmissions: Submission[] = [
  {
    id: '1',
    problemTitle: 'Two Sum',
    problemSlug: 'two-sum',
    studentName: 'Rahul Sharma',
    studentId: 'ST2024001',
    submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'Pending',
    language: 'Python',
    code: `def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`,
    testCasesPassed: 8,
    totalTestCases: 10,
    executionTime: '24ms',
    memoryUsed: '14.2MB',
  },
  {
    id: '2',
    problemTitle: 'Valid Parentheses',
    problemSlug: 'valid-parentheses',
    studentName: 'Priya Patel',
    studentId: 'ST2024002',
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'Accepted',
    language: 'JavaScript',
    code: `function isValid(s) {
    const stack = [];
    const map = { '(': ')', '{': '}', '[': ']' };
    
    for (let char of s) {
        if (map[char]) {
            stack.push(char);
        } else {
            if (map[stack.pop()] !== char) return false;
        }
    }
    return stack.length === 0;
}`,
    testCasesPassed: 10,
    totalTestCases: 10,
    executionTime: '18ms',
    memoryUsed: '10.5MB',
  },
  {
    id: '3',
    problemTitle: 'Binary Search',
    problemSlug: 'binary-search',
    studentName: 'Amit Kumar',
    studentId: 'ST2024003',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    language: 'Java',
    code: `public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
    testCasesPassed: 9,
    totalTestCases: 10,
    executionTime: '32ms',
    memoryUsed: '18.7MB',
  },
  {
    id: '4',
    problemTitle: 'Reverse Linked List',
    problemSlug: 'reverse-linked-list',
    studentName: 'Sneha Reddy',
    studentId: 'ST2024004',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Wrong Answer',
    language: 'C++',
    code: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    testCasesPassed: 5,
    totalTestCases: 10,
    executionTime: '28ms',
    memoryUsed: '16.3MB',
  },
  {
    id: '5',
    problemTitle: 'Maximum Subarray',
    problemSlug: 'maximum-subarray',
    studentName: 'Vikram Singh',
    studentId: 'ST2024005',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    language: 'Python',
    code: `def maxSubArray(nums):
    max_sum = current_sum = nums[0]
    
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum`,
    testCasesPassed: 10,
    totalTestCases: 10,
    executionTime: '45ms',
    memoryUsed: '20.1MB',
  },
  {
    id: '6',
    problemTitle: 'Climbing Stairs',
    problemSlug: 'climbing-stairs',
    studentName: 'Ananya Iyer',
    studentId: 'ST2024006',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    language: 'JavaScript',
    code: `function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev1 = 2, prev2 = 1;
    
    for (let i = 3; i <= n; i++) {
        let current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
    testCasesPassed: 8,
    totalTestCases: 10,
    executionTime: '15ms',
    memoryUsed: '9.8MB',
  },
];

const SubmissionReviewPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Accepted' | 'Rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => 
    statusFilter === 'all' || sub.status === statusFilter
  );

  // Handle approve submission
  const handleApprove = (submission: Submission) => {
    setSubmissions(submissions.map(s => 
      s.id === submission.id 
        ? { ...s, status: 'Accepted' } 
        : s
    ));
    setShowReviewModal(false);
    setFeedback('');
    alert(`Submission approved for ${submission.studentName}`);
  };

  // Handle reject submission
  const handleReject = (submission: Submission) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    setSubmissions(submissions.map(s => 
      s.id === submission.id 
        ? { ...s, status: 'Rejected' } 
        : s
    ));
    setShowReviewModal(false);
    setFeedback('');
    alert(`Submission rejected with feedback sent to ${submission.studentName}`);
  };

  // Handle view submission
  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
    setFeedback('');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
      case 'Wrong Answer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Rejected':
      case 'Wrong Answer':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get pass rate color
  const getPassRateColor = (passed: number, total: number) => {
    const percentage = (passed / total) * 100;
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Container>
      <PageHeader
        title="Submission Review"
        description="Review and manage student code submissions"
      />

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {submissions.filter(s => s.status === 'Pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'Accepted').length}
            </p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {submissions.filter(s => s.status === 'Rejected' || s.status === 'Wrong Answer').length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Accepted' | 'Rejected')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Submissions</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No submissions found</p>
              <p className="text-sm">Try changing your filter criteria</p>
            </div>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/coding/${submission.problemSlug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {submission.problemTitle}
                        </Link>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {submission.status}
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {submission.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{submission.studentName}</span>
                          <span className="text-gray-400">({submission.studentId})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatTimestamp(submission.submittedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Test Cases: </span>
                          <span className={`font-semibold ${getPassRateColor(submission.testCasesPassed, submission.totalTestCases)}`}>
                            {submission.testCasesPassed}/{submission.totalTestCases} passed
                          </span>
                        </div>
                        {submission.executionTime && (
                          <div>
                            <span className="text-gray-600">Execution: </span>
                            <span className="font-medium text-gray-900">{submission.executionTime}</span>
                          </div>
                        )}
                        {submission.memoryUsed && (
                          <div>
                            <span className="text-gray-600">Memory: </span>
                            <span className="font-medium text-gray-900">{submission.memoryUsed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewSubmission(submission)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{selectedSubmission.problemTitle}</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{selectedSubmission.studentName}</span>
                  <span className="text-gray-500">({selectedSubmission.studentId})</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {getStatusIcon(selectedSubmission.status)}
                  {selectedSubmission.status}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {selectedSubmission.language}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Test Results */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Test Results</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className={`text-2xl font-bold ${getPassRateColor(selectedSubmission.testCasesPassed, selectedSubmission.totalTestCases)}`}>
                      {selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases}
                    </p>
                    <p className="text-sm text-gray-600">Test Cases Passed</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedSubmission.executionTime}</p>
                    <p className="text-sm text-gray-600">Execution Time</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedSubmission.memoryUsed}</p>
                    <p className="text-sm text-gray-600">Memory Used</p>
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-gray-700" />
                  <h4 className="font-semibold">Submitted Code</h4>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono">{selectedSubmission.code}</pre>
                </div>
              </div>

              {/* Feedback Section */}
              {selectedSubmission.status === 'Pending' && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">Feedback (required for rejection)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedSubmission.status === 'Pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Submission
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Submission
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SubmissionReviewPage;
