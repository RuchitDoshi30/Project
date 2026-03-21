import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, PageHeader, Card, SkeletonTestList } from '../components';
import { Brain, Search, Filter, Clock, Trophy, ChevronRight, Target, RotateCcw, PlayCircle } from 'lucide-react';
import {
  getAptitudeTests,
  getAllCategories,
  getUserAttempts,
  hasInProgressAttempt
} from '../services/aptitude.service';
import { useAuth } from '../context/AuthContext';
import type { IAptitudeTest, IAptitudeAttempt, AptitudeCategory } from '../types/models';

const CATEGORY_EMOJI_ICONS: Record<AptitudeCategory, string> = {
  Quantitative: '🔢',
  Logical: '🧩',
  Verbal: '📝',
  Technical: '💻',
};

const AptitudePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || 'anon';

  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AptitudeCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [testsWithInProgress, setTestsWithInProgress] = useState<Set<string>>(new Set());
  const [tests, setTests] = useState<IAptitudeTest[]>([]);
  const [attempts, setAttempts] = useState<IAptitudeAttempt[]>([]);

  const allAvailableCategories = getAllCategories();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTests, setTotalTests] = useState(0);
  const limit = 20;

  // Load tests and attempts from API
  useEffect(() => {
    const load = async () => {
      setIsLoadingTests(true);
      try {
        const [testsRes, fetchedAttempts] = await Promise.all([
          getAptitudeTests({
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            page,
            limit,
          }),
          getUserAttempts(),
        ]);
        
        const fetchedTests = testsRes.data || [];
        setTests(fetchedTests.filter(Boolean));
        setAttempts((fetchedAttempts || []).filter(Boolean));
        setTotalPages(testsRes.totalPages || 1);
        setTotalTests(testsRes.total || 0);

        // Check in-progress tests (localStorage-based)
        const inProgressTestIds = new Set<string>();
        fetchedTests.forEach(test => {
          if (test && hasInProgressAttempt(test._id, currentUserId)) {
            inProgressTestIds.add(test._id);
          }
        });
        setTestsWithInProgress(inProgressTestIds);
      } catch (e) {
        console.error('Failed to load tests', e);
      } finally {
        setIsLoadingTests(false);
      }
    };
    
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, page]);

  // Reset to page 1 when filters change natively
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category: AptitudeCategory): string => {
    return CATEGORY_EMOJI_ICONS[category] || '📋';
  };

  const getTestStatistics = (testId: string) => {
    const completedAttempts = attempts.filter(a => a.testId === testId);
    if (completedAttempts.length === 0) return null;

    const bestAttempt = completedAttempts.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    return {
      attemptCount: completedAttempts.length,
      bestScore: bestAttempt.score,
      hasPassed: bestAttempt.passed,
    };
  };

  const handleStartTest = (testId: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/aptitude/test/${testId}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  if (isLoadingTests) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader title="Aptitude Tests" description="Sharpen your skills with practice tests across multiple categories" />
        <SkeletonTestList count={6} />
      </Container>
    );
  }

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="Aptitude Tests"
        description="Sharpen your skills with practice tests across multiple categories"
      />

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-lc-text-muted" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-lc-text-muted"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${showFilters || hasActiveFilters
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-lc-card border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-lc-card text-primary-600 dark:text-accent-400 rounded text-xs font-semibold">
                {(selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {allAvailableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                        }`}
                    >
                      <span>{getCategoryIcon(category)}</span>
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <Brain className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No tests found</h3>
              <p className="text-sm text-gray-500 dark:text-lc-text-muted">Try adjusting your filters or search query</p>
            </Card>
          </div>
        ) : (
          tests.map((test) => {
            const testStatistics = getTestStatistics(test._id);
            const hasInProgressTest = testsWithInProgress.has(test._id);
            const questionCount = Array.isArray(test.questions) ? test.questions.length : 0;

            return (
              <Card key={test._id} className="p-5 border-l-4 border-l-purple-500 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-gradient-to-r from-white dark:from-lc-card to-purple-50/30 dark:to-purple-900/10">
                <div className="block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(test.category)}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${test.category === 'Quantitative' ? 'bg-gradient-to-r from-blue-100 dark:from-blue-900/40 to-cyan-100 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' :
                          test.category === 'Logical' ? 'bg-gradient-to-r from-purple-100 dark:from-purple-900/40 to-pink-100 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' :
                            test.category === 'Verbal' ? 'bg-gradient-to-r from-green-100 dark:from-green-900/40 to-emerald-100 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' :
                              'bg-gradient-to-r from-orange-100 dark:from-orange-900/40 to-red-100 dark:to-red-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                          }`}>
                          {test.category}
                        </span>
                        {hasInProgressTest && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gradient-to-r from-amber-100 dark:from-amber-900/40 to-yellow-100 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 animate-pulse">
                            ⏳ In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-lc-text mb-1">
                        {test.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-lc-text-muted line-clamp-2">{test.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-600 dark:text-lc-text-muted font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{test.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span>{questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>{test.passingPercentage}% to pass</span>
                    </div>
                  </div>

                  {testStatistics && (
                    <div className={`p-2.5 rounded-lg mb-3 ${testStatistics.hasPassed
                      ? 'bg-gradient-to-r from-green-50 dark:from-green-900/30 to-emerald-50 dark:to-emerald-900/30 border border-green-200 dark:border-green-700'
                      : 'bg-gradient-to-r from-orange-50 dark:from-orange-900/30 to-yellow-50 dark:to-yellow-900/30 border border-orange-200 dark:border-orange-700'
                      }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 dark:text-lc-text-secondary">
                          {testStatistics.hasPassed ? '✅' : '📊'} Best Score: <span className={testStatistics.hasPassed ? 'text-green-700 dark:text-green-400 font-bold' : 'text-orange-700 dark:text-orange-400 font-bold'}>
                            {testStatistics.bestScore}%
                          </span>
                        </span>
                        <span className="text-gray-600 dark:text-lc-text-muted font-medium">
                          {testStatistics.attemptCount} attempt{testStatistics.attemptCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-lc-border">
                    {hasInProgressTest ? (
                      <button
                        onClick={(e) => handleStartTest(test._id, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Resume Test
                      </button>
                    ) : testStatistics ? (
                      <button
                        onClick={(e) => handleStartTest(test._id, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-accent-500/15 dark:hover:bg-accent-500/25 text-white dark:text-accent-400 dark:border dark:border-accent-500/30 rounded-lg font-medium text-sm transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake Test
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleStartTest(test._id, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-accent-500/15 dark:hover:bg-accent-500/25 text-white dark:text-accent-400 dark:border dark:border-accent-500/30 rounded-lg font-medium text-sm transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {tests.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-lc-border-light pt-6">
          <div className="text-sm text-gray-500 dark:text-lc-text-muted mb-4 sm:mb-0">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * limit, totalTests)}</span> of{' '}
            <span className="font-medium">{totalTests}</span> tests
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 dark:border-lc-border-light rounded-md text-sm font-medium text-gray-700 dark:text-lc-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-lc-text hover:bg-gray-100 dark:hover:bg-lc-elevated border border-transparent hover:border-gray-200 dark:hover:border-lc-border-light'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-300 dark:border-lc-border-light rounded-md text-sm font-medium text-gray-700 dark:text-lc-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AptitudePage;
