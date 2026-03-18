import { useState, useEffect } from 'react';
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
import { api } from '../services/api.client';

interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  status: string;
  submittedAt: string;
  code: string;
}

const SubmissionHistoryPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<{ success: boolean; data: any[] }>('/submissions/me');
        const subs = response.data.map((s: any) => ({
          id: s._id,
          problemId: s.problemId?._id || s.problemId || '',
          problemTitle: s.problemId?.title || 'Unknown Problem',
          problemDifficulty: s.problemId?.difficulty || 'Beginner',
          language: s.language || 'JavaScript',
          status: (s.status || 'Pending').toLowerCase().replace(/\s+/g, '-'),
          submittedAt: s.submittedAt || s.createdAt || new Date().toISOString(),
          code: s.code || '',
        }));
        setSubmissions(subs);
      } catch (e) {
        console.error('Failed to load submissions', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const languages = Array.from(new Set(submissions.map(s => s.language)));

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.problemTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || submission.language === languageFilter;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDownload = (submission: Submission) => {
    const blob = new Blob([submission.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submission.problemTitle.replace(/\s+/g, '_')}_${submission.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: submissions.length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    failed: submissions.filter(s => s.status !== 'accepted').length,
    acceptanceRate: submissions.length > 0 ? Math.round((submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100) : 0,
  };

  if (loading) {
    return (
      <Container>
        <PageHeader title="Submission History" description="View and analyze all your code submissions" />
        <div className="space-y-3">{[1,2,3].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-16 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Submission History" description="View and analyze all your code submissions" />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Total Submissions</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.total}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">All attempts</p></div>
            <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-lg"><Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Accepted</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.accepted}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Success</p></div>
            <div className="bg-green-50 dark:bg-green-900/40 p-2.5 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Failed</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.failed}</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Attempts</p></div>
            <div className="bg-red-50 dark:bg-red-900/40 p-2.5 rounded-lg"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1"><p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Acceptance Rate</p><p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">{stats.acceptanceRate}%</p><p className="text-xs text-gray-400 dark:text-lc-text-muted">Success rate</p></div>
            <div className="bg-purple-50 dark:bg-purple-900/40 p-2.5 rounded-lg"><Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by problem name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="pending-review">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent">
            <option value="all">All Languages</option>
            {languages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
          </select>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card className="p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No submissions found</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Try adjusting your filters or start solving problems!</p>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <h3 className="text-base font-bold text-gray-900 dark:text-lc-text">{submission.problemTitle}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        submission.problemDifficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' :
                        submission.problemDifficulty === 'Intermediate' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700' :
                        'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                      }`}>{submission.problemDifficulty}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-lc-text-muted">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(submission.submittedAt)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium border ${
                        submission.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' :
                        'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                      }`}>{submission.status.replace(/-/g, ' ').toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary font-semibold border border-gray-200 dark:border-lc-border-light">{submission.language}</span>
                    </div>
                  </div>
                  <button onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                    {expandedSubmission === submission.id ? 'Hide' : 'View'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSubmission === submission.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedSubmission === submission.id && submission.code && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-lc-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-lc-text">Submitted Code</h4>
                      <button onClick={() => handleDownload(submission)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-all">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{submission.code}</code></pre>
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
