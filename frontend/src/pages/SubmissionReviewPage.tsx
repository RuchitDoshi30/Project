import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Code, User, Calendar, Filter } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import { api } from '../services/api.client';
import toast from 'react-hot-toast';

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


const SubmissionReviewPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Accepted' | 'Rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  const mapApiSubmission = (s: any): Submission => ({
    id: s._id,
    problemTitle: s.problemId?.title || 'Unknown',
    problemSlug: s.problemId?.slug || 'unknown',
    studentName: s.userId?.name || 'Unknown',
    studentId: s.userId?.universityId || 'Unknown',
    submittedAt: s.submittedAt,
    status: s.status === 'Pending Review' ? 'Pending' : s.status,
    language: s.language || 'Unknown',
    code: s.code || '',
    testCasesPassed: s.testCasesPassed || 0,
    totalTestCases: s.totalTestCases || 0,
  });

  const loadSubmissions = async (cursor?: string | null) => {
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (cursor) params.append('cursor', cursor);
      if (statusFilter !== 'all') {
        const apiStatus = statusFilter === 'Pending' ? 'Pending Review' : statusFilter;
        params.append('status', apiStatus);
      }
      const response = await api.get<{ success: boolean; data: any[]; nextCursor: string | null; hasMore: boolean }>(`/submissions/admin?${params.toString()}`);
      const mapped = response.data.map(mapApiSubmission);
      if (cursor) {
        setSubmissions(prev => [...prev, ...mapped]);
      } else {
        setSubmissions(mapped);
      }
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (e) {
      console.error('Failed to load submissions', e);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadSubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    loadSubmissions(nextCursor);
  };

  // Filter submissions (already filtered server-side by status, so show all here)
  const filteredSubmissions = submissions;

  // Handle approve submission
  const handleApprove = async (submission: Submission) => {
    try {
      await api.patch(`/submissions/${submission.id}/approve`);
      setSubmissions(submissions.map(s =>
        s.id === submission.id ? { ...s, status: 'Accepted' as const } : s
      ));
      setShowReviewModal(false);
      setFeedback('');
      toast.success(`Submission approved for ${submission.studentName}`);
    } catch (e) {
      console.error('Failed to approve', e);
      toast.error('Failed to approve submission');
    }
  };

  // Handle reject submission
  const handleReject = async (submission: Submission) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    try {
      await api.patch(`/submissions/${submission.id}/reject`);
      setSubmissions(submissions.map(s =>
        s.id === submission.id ? { ...s, status: 'Rejected' as const } : s
      ));
      setShowReviewModal(false);
      setFeedback('');
      toast.success(`Submission rejected for ${submission.studentName}`);
    } catch (e) {
      console.error('Failed to reject', e);
      toast.error('Failed to reject submission');
    }
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
            <Filter className="text-gray-400 w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Accepted' | 'Rejected')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
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
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" aria-hidden="true" />
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
                          <User className="w-4 h-4" aria-hidden="true" />
                          <span>{submission.studentName}</span>
                          <span className="text-gray-400">({submission.studentId})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
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
                  {submission.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(submission)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        aria-label={`Approve submission from ${submission.studentName}`}
                      >
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleViewSubmission(submission)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        aria-label={`Reject submission from ${submission.studentName}`}
                      >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleViewSubmission(submission)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label={`View submission details for ${submission.studentName}`}
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    View
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {loading ? (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-lc-elevated rounded"></div>
            </Card>
          ))}
        </div>
      ) : hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loadingMore ? 'Loading...' : 'Load More Submissions'}
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-review-title"
        >
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 id="submission-review-title" className="text-2xl font-bold">
                  {selectedSubmission.problemTitle}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close review"
                >
                  <XCircle className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent resize-none"
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
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    Approve Submission
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" aria-hidden="true" />
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
