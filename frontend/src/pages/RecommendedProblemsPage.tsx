import { useState, useEffect } from 'react';
import { Container, PageHeader, Card } from '../components';
import { Sparkles, Code2, CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react';
import { getProblemsWithStatus } from '../services/problems.service';
import type { IProblem, IProblemProgress } from '../types/models';

const RecommendedProblemsPage = () => {
  const [recommendations, setRecommendations] = useState<(IProblem & { progress: IProblemProgress; reason: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id || 'anon';
        const problems = await getProblemsWithStatus(userId);

        // Simple recommendation engine:
        // 1. Unsolved problems first (prioritize beginner if user hasn't solved many)
        // 2. Attempted but not solved
        // 3. Mix of difficulties based on user's skill level
        const solved = problems.filter(p => p.progress.status === 'solved');
        const attempted = problems.filter(p => p.progress.status === 'attempted');
        const unsolved = problems.filter(p => p.progress.status === 'unsolved');
        
        const recommended: (IProblem & { progress: IProblemProgress; reason: string })[] = [];

        // Add attempted-but-not-solved first (user should retry these)
        attempted.slice(0, 3).forEach(p => {
          recommended.push({ ...p, reason: '🔄 You started this — finish it!' });
        });

        // Recommend based on skill level
        if (solved.length < 5) {
          // Beginner: recommend easy problems
          unsolved
            .filter(p => p.difficulty === 'Beginner')
            .slice(0, 5)
            .forEach(p => recommended.push({ ...p, reason: '🌱 Great for beginners' }));
        } else if (solved.length < 15) {
          // Intermediate
          unsolved
            .filter(p => p.difficulty === 'Intermediate')
            .slice(0, 3)
            .forEach(p => recommended.push({ ...p, reason: '📈 Challenge yourself' }));
          unsolved
            .filter(p => p.difficulty === 'Beginner')
            .slice(0, 2)
            .forEach(p => recommended.push({ ...p, reason: '✅ Build confidence' }));
        } else {
          // Advanced
          unsolved
            .filter(p => p.difficulty === 'Advanced')
            .slice(0, 3)
            .forEach(p => recommended.push({ ...p, reason: '🔥 Advanced challenge' }));
          unsolved
            .filter(p => p.difficulty === 'Intermediate')
            .slice(0, 2)
            .forEach(p => recommended.push({ ...p, reason: '💪 Stay sharp' }));
        }

        // Fill remaining with random unsolved if we have fewer than 8
        if (recommended.length < 8) {
          const existingIds = new Set(recommended.map(r => r._id));
          const remaining = unsolved.filter(p => !existingIds.has(p._id));
          remaining.slice(0, 8 - recommended.length).forEach(p => {
            recommended.push({ ...p, reason: '📚 Explore new topics' });
          });
        }

        setRecommendations(recommended.slice(0, 10));
      } catch (e) {
        console.error('Failed to load recommendations', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'attempted': return <Circle className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  if (loading) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader title="Recommended for You" description="Problems selected based on your progress and skill level" />
        <div className="space-y-3">{[1,2,3,4].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-16 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container size="xl" fullHeight>
      <PageHeader title="Recommended for You" description="Problems selected based on your progress and skill level" />

      {/* Header Card */}
      <Card className="mb-6 p-5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-300" />
          <div>
            <h3 className="text-lg font-bold">Smart Recommendations</h3>
            <p className="text-sm text-purple-200">
              {recommendations.length} problems picked based on your progress, difficulty level, and areas for improvement.
            </p>
          </div>
        </div>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <Card className="p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No recommendations available</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Complete some problems first to get personalized recommendations!</p>
          </Card>
        ) : (
          recommendations.map((problem, index) => (
            <Card key={problem._id} className="p-4 border-l-4 border-l-purple-500 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-gradient-to-r from-white dark:from-lc-card to-purple-50/30 dark:to-purple-900/10">
              <a href={`/coding/${problem.slug}`} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-bold text-gray-400 dark:text-lc-text-muted w-6 text-right">#{index + 1}</span>
                  {getStatusIcon(problem.progress.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {problem.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      problem.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' :
                      problem.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700' :
                      'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                    }`}>{problem.difficulty}</span>
                    {problem.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted rounded">{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{problem.reason}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-lc-text-muted sm:flex-shrink-0">
                  {problem.progress.timeSpent > 0 && (
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatTime(problem.progress.timeSpent)}</span></div>
                  )}
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              </a>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default RecommendedProblemsPage;
