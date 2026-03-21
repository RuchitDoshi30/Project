import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Play, Save, RotateCcw, ChevronDown, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, Wand2, History, Clock, Tag
} from 'lucide-react';
import { 
  getProblemBySlug, 
  saveCode, 
  getSavedCode,
  updateTimeSpent,
  updateProblemStatus,
  getSubmissionHistory,
  validateTestCases,
  formatCode,
  codeSnippets,
  getProblemsWithStatus,
  submitCode
} from '../services/problems.service';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components';
import type { IProblem, ISubmission, ITestCaseResult, IProblemProgress } from '../types/models';
import { sanitizeHtml } from '../utils/sanitize';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const DEFAULT_CODE = {
  javascript: `function solution() {\n  // Write your code here\n  \n}\n\n// Test your solution\nsolution();`,
  python: `def solution():\n    # Write your code here\n    pass\n\n# Test your solution\nsolution()`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getDifficultyColor = (difficulty: string) => {
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

const ProblemSolvePage = () => {
  const { id: problemSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || 'anon';
  
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved');
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'submissions' | 'results'>('description');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [testResults, setTestResults] = useState<ITestCaseResult[]>([]);
  const [showSnippets, setShowSnippets] = useState(false);
  const [allProblems, setAllProblems] = useState<(IProblem & { progress: IProblemProgress })[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadProblem = async () => {
      if (!problemSlug) return;
      const foundProblem = await getProblemBySlug(problemSlug);
      if (foundProblem) {
        setProblem(foundProblem);
        
        // Load saved code if exists
        const saved = getSavedCode(foundProblem._id, userId);
        if (saved) {
          setLanguage(saved.language);
          setCode(saved.code);
          setSaveStatus('saved');
        }

        // Load submission history
        try {
          const history = await getSubmissionHistory(foundProblem._id);
          setSubmissions(history);
        } catch {
          setSubmissions([]);
        }
        
        // Load all problems for navigation (high limit to enable prev/next)
        try {
          const problems = await getProblemsWithStatus(userId, { limit: 500 });
          setAllProblems(problems.data);
        } catch {
          setAllProblems([]);
        }
      } else {
        navigate('/coding');
      }
    };
    loadProblem();
  }, [problemSlug, navigate, userId]);

  // Timer for tracking time spent
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Save time spent when leaving page
      if (problem) {
        const secondsSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        updateTimeSpent(problem._id, userId, secondsSpent);
      }
    };
  }, [problem, userId]);

  useEffect(() => {
    // Update code template when language changes (only if no saved code)
    if (saveStatus !== 'saved') {
      setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]);
    }
  }, [language, saveStatus]);

  const handleSave = async () => {
    if (!problem) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await saveCode(problem._id, userId, code, language);
      setSaveStatus('saved');
      updateProblemStatus(problem._id, userId, 'attempted');
      toast.success('Code saved successfully', { duration: 2000 });
      setTimeout(() => setSaveStatus('unsaved'), 2000);
    } catch {
      toast.error('Failed to save code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your code?')) {
      setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE]);
      setSaveStatus('unsaved');
      toast.success('Code reset to default template');
    }
  };

  const handleFormat = () => {
    const formatted = formatCode(code, language);
    setCode(formatted);
    setSaveStatus('unsaved');
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    // Run local test cases for immediate feedback
    const results = validateTestCases(problem._id, code);
    setTestResults(results);
    setActiveTab('results');
    
    // Submit to backend (persists to DB)
    try {
      const submission = await submitCode(problem._id, code, language);
      setSubmissions(prev => [submission, ...prev]);
      
      // Update local progress status
      const status = submission.status === 'Accepted' ? 'solved' : 'attempted';
      updateProblemStatus(problem._id, userId, status as 'solved' | 'attempted');
      toast.success('Code submitted successfully!');
    } catch {
      toast.error('Failed to submit code. Please try again.');
      // Fallback: still update local status
      updateProblemStatus(problem._id, userId, 'attempted');
    }
  };

  const insertSnippet = (snippetCode: string) => {
    setCode(prev => prev + '\n\n' + snippetCode);
    setShowSnippets(false);
    setSaveStatus('unsaved');
  };

  const loadSubmission = (submission: ISubmission) => {
    setCode(submission.code);
    setLanguage(submission.language);
    setSaveStatus('unsaved');
    setActiveTab('description');
  };

  const navigateToProblem = (direction: 'prev' | 'next') => {
    if (!problem) return;
    const currentIndex = allProblems.findIndex(p => p._id === problem._id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allProblems.length) {
      navigate(`/coding/${allProblems[newIndex].slug}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-50';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-50';
      case 'Time Limit Exceeded':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const sanitizedDescriptionHtml = useMemo(() => {
    const description = problem?.description ?? '';

    const rawHtml = description
      .replace(
        /`([^`]+)`/g,
        '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-900">$1</code>'
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mt-4">')
      .replace(
        /^```([\s\S]*?)```/gm,
        '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
      );

    return sanitizeHtml(rawHtml);
  }, [problem?.description]);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  const currentIndex = allProblems.findIndex(p => p._id === problem._id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allProblems.length - 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ProblemHeader
        problem={problem}
        elapsedTime={elapsedTime}
        language={language}
        isFullscreen={isFullscreen}
        isSaving={isSaving}
        saveStatus={saveStatus}
        showSnippets={showSnippets}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onBack={() => navigate('/coding')}
        onNavigateToProblem={navigateToProblem}
        onChangeLanguage={setLanguage}
        onToggleSnippets={() => setShowSnippets(!showSnippets)}
        onInsertSnippet={insertSnippet}
        onFormat={handleFormat}
        onReset={handleReset}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onSave={handleSave}
        onSubmit={handleSubmit}
      />

      {/* Main Content - Split Panes */}
      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Left Pane - Problem Description */}
        {!isFullscreen && (
          <ProblemTabsAndContent
            problem={problem}
            activeTab={activeTab}
            submissions={submissions}
            testResults={testResults}
            sanitizedDescriptionHtml={sanitizedDescriptionHtml}
            onChangeTab={setActiveTab}
            onLoadSubmission={loadSubmission}
            getStatusColor={getStatusColor}
          />
        )}

        <CodeEditorPane
          isFullscreen={isFullscreen}
          language={language}
          code={code}
          onChangeCode={(value) => {
            setCode(value);
            setSaveStatus('unsaved');
          }}
        />
      </div>
    </div>
  );
};

export default ProblemSolvePage;

// ────────────────────────────────────────────────────────────
// Presentation Components
// ────────────────────────────────────────────────────────────

interface ProblemHeaderProps {
  problem: IProblem;
  elapsedTime: number;
  language: string;
  isFullscreen: boolean;
  isSaving: boolean;
  saveStatus: 'saved' | 'unsaved' | 'saving';
  showSnippets: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onNavigateToProblem: (direction: 'prev' | 'next') => void;
  onChangeLanguage: (lang: string) => void;
  onToggleSnippets: () => void;
  onInsertSnippet: (code: string) => void;
  onFormat: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onSave: () => void;
  onSubmit: () => void;
}

const ProblemHeader = memo(function ProblemHeader({
  problem,
  elapsedTime,
  language,
  isFullscreen,
  isSaving,
  saveStatus,
  showSnippets,
  hasPrev,
  hasNext,
  onBack,
  onNavigateToProblem,
  onChangeLanguage,
  onToggleSnippets,
  onInsertSnippet,
  onFormat,
  onReset,
  onToggleFullscreen,
  onSave,
  onSubmit,
}: ProblemHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to problems"
            aria-label="Back to problems"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
            <button
              onClick={() => onNavigateToProblem('prev')}
              disabled={!hasPrev}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous problem"
              aria-label="Previous problem"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </button>
            <button
              onClick={() => onNavigateToProblem('next')}
              disabled={!hasNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next problem"
              aria-label="Next problem"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-gray-900">{problem.title}</h1>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Tag className="w-3 h-3 text-gray-400" aria-hidden="true" />
              {problem.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              {formatTime(elapsedTime)}
            </span>
          </div>

          <div className="relative">
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <button
              onClick={onToggleSnippets}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Insert code snippet"
            >
              <Wand2 className="w-4 h-4" aria-hidden="true" />
              Snippets
            </button>
            {showSnippets && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700">Code Snippets</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {codeSnippets[language as keyof typeof codeSnippets]?.map((snippet, idx) => (
                    <button
                      key={idx}
                      onClick={() => onInsertSnippet(snippet.code)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{snippet.label}</p>
                      {snippet.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {snippet.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onFormat}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Format code"
          >
            <Wand2 className="w-4 h-4" aria-hidden="true" />
            Format
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
              ? 'Saved'
              : 'Save'}
          </button>

          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
});

interface ProblemTabsAndContentProps {
  problem: IProblem;
  activeTab: 'description' | 'testcases' | 'submissions' | 'results';
  submissions: ISubmission[];
  testResults: ITestCaseResult[];
  sanitizedDescriptionHtml: string;
  onChangeTab: (tab: 'description' | 'testcases' | 'submissions' | 'results') => void;
  onLoadSubmission: (submission: ISubmission) => void;
  getStatusColor: (status: string) => string;
}

const ProblemTabsAndContent = ({
  problem,
  activeTab,
  submissions,
  testResults,
  sanitizedDescriptionHtml,
  onChangeTab,
  onLoadSubmission,
  getStatusColor,
}: ProblemTabsAndContentProps) => (
  <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar">
    <div className="p-6">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => onChangeTab('description')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'description'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => onChangeTab('testcases')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'testcases'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Test Cases
        </button>
        <button
          onClick={() => onChangeTab('submissions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'submissions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1">
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            Submissions
            {submissions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-semibold">
                {submissions.length}
              </span>
            )}
          </div>
        </button>
        {testResults.length > 0 && (
          <button
            onClick={() => onChangeTab('results')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Results
          </button>
        )}
      </div>

      {activeTab === 'description' && (
        <div className="prose prose-sm max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitizedDescriptionHtml,
            }}
          />

          {problem.constraints && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Constraints:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                {problem.constraints.split('\n').map((constraint, idx) => (
                  <div key={idx}>{constraint}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'testcases' && (
        <div className="space-y-3">
          {problem.testCases.map(
            (testCase, idx) =>
              !testCase.isHidden && (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Example {idx + 1}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Input:</p>
                      <code className="block px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-900">
                        {testCase.input}
                      </code>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Expected Output:
                      </p>
                      <code className="block px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-900">
                        {testCase.expectedOutput}
                      </code>
                    </div>
                  </div>
                </Card>
              )
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-500">No submissions yet</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <Card
                key={sub._id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onLoadSubmission(sub)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Load Code
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>{sub.language}</span>
                  <span>•</span>
                  <span>
                    {sub.testCasesPassed}/{sub.totalTestCases} passed
                  </span>
                  {sub.executionTime && (
                    <>
                      <span>•</span>
                      <span>{sub.executionTime}ms</span>
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'results' && testResults.length > 0 && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {testResults.filter((r) => r.passed).length}/{testResults.length} Test
                Cases Passed
              </p>
              {testResults.every((r) => r.passed) && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                  All Passed! ✓
                </span>
              )}
            </div>
          </div>

          {testResults.map((result, idx) => (
            <Card
              key={idx}
              className={`p-4 border-l-4 ${
                result.passed ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Test Case {idx + 1}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    result.passed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {result.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Input:</p>
                  <code className="block px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-900">
                    {result.input}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Expected:</p>
                  <code className="block px-3 py-2 bg-green-50 rounded text-sm font-mono text-gray-900">
                    {result.expectedOutput}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Your Output:</p>
                  <code
                    className={`block px-3 py-2 rounded text-sm font-mono text-gray-900 ${
                      result.passed ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.actualOutput}
                  </code>
                </div>
                {result.executionTime && (
                  <p className="text-xs text-gray-500">
                    Execution: {result.executionTime}ms
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>
);

interface CodeEditorPaneProps {
  isFullscreen: boolean;
  language: string;
  code: string;
  onChangeCode: (value: string) => void;
}

const CodeEditorPane = ({
  isFullscreen,
  language,
  code,
  onChangeCode,
}: CodeEditorPaneProps) => (
  <div className={`${isFullscreen ? 'w-full' : 'w-1/2'} flex flex-col bg-[#1e1e1e]`}>
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={(value) => onChangeCode(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  </div>
);
