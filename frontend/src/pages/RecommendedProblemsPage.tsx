import { useState, useEffect } from 'react';
import { Container, PageHeader, Card } from '../components';
import { Sparkles, Code2, CheckCircle, ChevronRight, Brain, TrendingUp, AlertTriangle, BookOpen, RotateCcw, Target } from 'lucide-react';
import { fetchRecommendations } from '../services/dashboard.service';
import type { RecommendedProblem, RecommendedTest, RecommendationSummary } from '../services/dashboard.service';

const categoryIcons: Record<string, typeof Sparkles> = {
  'retry': RotateCcw,
  'weak-area': AlertTriangle,
  'progression': TrendingUp,
  'explore': BookOpen,
  'popular': Target,
};

const categoryColors: Record<string, string> = {
  'retry': 'border-l-orange-500',
  'weak-area': 'border-l-red-500',
  'progression': 'border-l-blue-500',
  'explore': 'border-l-green-500',
  'popular': 'border-l-purple-500',
};

const difficultyStyles: Record<string, string> = {
  'Beginner': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700',
  'Intermediate': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  'Advanced': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700',
};

const RecommendedProblemsPage = () => {
  const [problems, setProblems] = useState<RecommendedProblem[]>([]);
  const [aptitudeTests, setAptitudeTests] = useState<RecommendedTest[]>([]);
  const [summary, setSummary] = useState<RecommendationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecommendations();
        setProblems(data.problems);
        setAptitudeTests(data.aptitudeTests);
        setSummary(data.summary);
      } catch (e) {
        console.error('Failed to load recommendations', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader title="Recommended for You" description="Smart recommendations based on your performance" />
        <div className="space-y-3">{[1,2,3,4].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-16 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container size="xl" fullHeight>
      <PageHeader title="Recommended for You" description="Smart recommendations powered by your performance data" />

      {/* Summary Card */}
      {summary && (
        <Card className="mb-6 p-5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <div>
              <h3 className="text-lg font-bold">Your Profile</h3>
              <p className="text-sm text-purple-200">
                Skill Level: <span className="font-semibold text-white">{summary.skillLevel}</span> · {summary.totalSolved}/{summary.totalProblems} solved · {summary.aptitudeTestsTaken} tests taken
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {summary.weakTags.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-purple-200 mb-1">Needs Practice</p>
                <div className="flex flex-wrap gap-1">
                  {summary.weakTags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-red-500/30 text-red-100 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {summary.strongTags.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-purple-200 mb-1">Strong Areas</p>
                <div className="flex flex-wrap gap-1">
                  {summary.strongTags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-green-500/30 text-green-100 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {summary.totalAttempted > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-purple-200 mb-1">Unfinished</p>
                <p className="text-lg font-bold">{summary.totalAttempted} problems</p>
                <p className="text-xs text-purple-200">attempted but not solved</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Coding Recommendations */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-lc-text mb-3 flex items-center gap-2">
        <Code2 className="w-5 h-5 text-purple-500" />
        Coding Problems ({problems.length})
      </h2>
      <div className="space-y-3 mb-8">
        {problems.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">You've solved everything — amazing work! 🎉</p>
          </Card>
        ) : (
          problems.map((problem, index) => {
            const CategoryIcon = categoryIcons[problem.category] || Sparkles;
            const borderColor = categoryColors[problem.category] || 'border-l-purple-500';

            return (
              <Card key={problem._id} className={`p-4 border-l-4 ${borderColor} hover:shadow-xl hover:scale-[1.01] transition-all duration-300`}>
                <a href={`/coding/${problem.slug}`} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-lg font-bold text-gray-400 dark:text-lc-text-muted w-6 text-right">#{index + 1}</span>
                    <CategoryIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        {problem.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${difficultyStyles[problem.difficulty] || ''}`}>
                        {problem.difficulty}
                      </span>
                      {problem.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted rounded">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{problem.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <span className="text-xs text-gray-400 dark:text-lc-text-muted">Score: {problem.score}</span>
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </div>
                </a>
              </Card>
            );
          })
        )}
      </div>

      {/* Aptitude Recommendations */}
      {aptitudeTests.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 dark:text-lc-text mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            Aptitude Tests ({aptitudeTests.length})
          </h2>
          <div className="space-y-3">
            {aptitudeTests.map(test => (
              <Card key={test._id} className="p-4 border-l-4 border-l-indigo-500 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <a href="/aptitude" className="flex items-center gap-4">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text">{test.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-lc-text-muted">{test.category}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{test.reason}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-400" />
                </a>
              </Card>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default RecommendedProblemsPage;
