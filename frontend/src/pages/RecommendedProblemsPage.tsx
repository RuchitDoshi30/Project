import { useState } from 'react';
import { Lightbulb, Target, TrendingUp, Zap, Code2, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';

type RecommendationCategory = 'weak-areas' | 'progressive' | 'trending' | 'quick-wins';

interface Problem {
  _id: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  acceptanceRate: number;
  totalAttempts: number;
  estimatedTime: number; // in minutes
  reasonForRecommendation: string;
  isSolved?: boolean;
}

interface RecommendationSection {
  category: RecommendationCategory;
  title: string;
  description: string;
  icon: typeof Lightbulb;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  problems: Problem[];
}

const RecommendedProblemsPage = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<RecommendationCategory | null>('weak-areas');

  // Mock data - replace with API call
  const recommendations: RecommendationSection[] = [
    {
      category: 'weak-areas',
      title: 'Strengthen Weak Areas',
      description: 'Based on your recent performance, practice these topics to improve',
      icon: Target,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      problems: [
        {
          _id: '1',
          slug: 'binary-search-tree-validation',
          title: 'Validate Binary Search Tree',
          difficulty: 'Intermediate',
          topic: 'Trees',
          acceptanceRate: 45,
          totalAttempts: 1230,
          estimatedTime: 25,
          reasonForRecommendation: 'You struggled with tree problems recently. This will help build your foundation.',
        },
        {
          _id: '2',
          slug: 'dynamic-programming-fibonacci',
          title: 'Fibonacci with DP',
          difficulty: 'Beginner',
          topic: 'Dynamic Programming',
          acceptanceRate: 65,
          totalAttempts: 2340,
          estimatedTime: 15,
          reasonForRecommendation: 'Start with DP basics - your success rate in this topic is below average.',
        },
        {
          _id: '3',
          slug: 'graph-cycle-detection',
          title: 'Detect Cycle in Graph',
          difficulty: 'Intermediate',
          topic: 'Graphs',
          acceptanceRate: 52,
          totalAttempts: 980,
          estimatedTime: 30,
          reasonForRecommendation: 'You have not attempted any graph problems yet. Start here!',
        },
      ],
    },
    {
      category: 'progressive',
      title: 'Progressive Challenge',
      description: 'Next level problems based on what you have mastered',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      problems: [
        {
          _id: '4',
          slug: 'merge-k-sorted-lists',
          title: 'Merge K Sorted Lists',
          difficulty: 'Advanced',
          topic: 'Linked Lists',
          acceptanceRate: 38,
          totalAttempts: 1560,
          estimatedTime: 35,
          reasonForRecommendation: 'You mastered basic linked lists. Ready for advanced challenges!',
          isSolved: false,
        },
        {
          _id: '5',
          slug: 'longest-increasing-subsequence',
          title: 'Longest Increasing Subsequence',
          difficulty: 'Intermediate',
          topic: 'Dynamic Programming',
          acceptanceRate: 48,
          totalAttempts: 1890,
          estimatedTime: 28,
          reasonForRecommendation: 'Build on your array skills with this classic DP problem.',
        },
      ],
    },
    {
      category: 'trending',
      title: 'Trending Problems',
      description: 'Popular problems your peers are solving right now',
      icon: Lightbulb,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      problems: [
        {
          _id: '6',
          slug: 'two-sum-variant',
          title: 'Two Sum - All Pairs',
          difficulty: 'Beginner',
          topic: 'Arrays',
          acceptanceRate: 72,
          totalAttempts: 3450,
          estimatedTime: 12,
          reasonForRecommendation: 'Most solved problem this week - join the trend!',
        },
        {
          _id: '7',
          slug: 'container-with-most-water',
          title: 'Container With Most Water',
          difficulty: 'Intermediate',
          topic: 'Two Pointers',
          acceptanceRate: 55,
          totalAttempts: 2180,
          estimatedTime: 20,
          reasonForRecommendation: '156 students solved this in the last 7 days.',
        },
      ],
    },
    {
      category: 'quick-wins',
      title: 'Quick Wins',
      description: 'Easy problems to boost confidence and maintain momentum',
      icon: Zap,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      problems: [
        {
          _id: '8',
          slug: 'palindrome-check',
          title: 'Check Palindrome',
          difficulty: 'Beginner',
          topic: 'Strings',
          acceptanceRate: 85,
          totalAttempts: 4230,
          estimatedTime: 8,
          reasonForRecommendation: 'Quick confidence booster - 85% acceptance rate!',
        },
        {
          _id: '9',
          slug: 'find-missing-number',
          title: 'Find Missing Number',
          difficulty: 'Beginner',
          topic: 'Arrays',
          acceptanceRate: 78,
          totalAttempts: 3890,
          estimatedTime: 10,
          reasonForRecommendation: 'Perfect warm-up problem to start your session.',
        },
        {
          _id: '10',
          slug: 'reverse-integer',
          title: 'Reverse Integer',
          difficulty: 'Beginner',
          topic: 'Math',
          acceptanceRate: 81,
          totalAttempts: 3560,
          estimatedTime: 10,
          reasonForRecommendation: 'Build momentum with this straightforward problem.',
        },
      ],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'Intermediate':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary border-gray-200 dark:border-lc-border-light';
    }
  };

  const handleStartProblem = (slug: string) => {
    navigate(`/student/coding/problem/${slug}`);
  };

  const toggleSection = (category: RecommendationCategory) => {
    setExpandedSection(expandedSection === category ? null : category);
  };

  // Calculate total recommendations
  const totalRecommendations = recommendations.reduce((sum, section) => sum + section.problems.length, 0);

  return (
    <Container>
      <PageHeader
        title="Recommended For You"
        description="Personalized problem recommendations based on your learning journey"
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Total Picks</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRecommendations}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Weak Areas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {recommendations.find(r => r.category === 'weak-areas')?.problems.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Trending</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {recommendations.find(r => r.category === 'trending')?.problems.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Quick Wins</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {recommendations.find(r => r.category === 'quick-wins')?.problems.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendation Sections */}
        {recommendations.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.category;

          return (
            <Card key={section.category} className={`border-2 ${section.borderColor}`}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-lc-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-lc-text-muted">{section.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${section.bgColor} border ${section.borderColor}`}>
                  <span className={`text-sm font-bold ${section.iconColor}`}>
                    {section.problems.length} problems
                  </span>
                </div>
              </button>

              {/* Problems List */}
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-lc-border">
                  {section.problems.map((problem) => (
                    <div
                      key={problem._id}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-lc-border hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {problem.isSolved && (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                            <h3 className="font-bold text-gray-900 dark:text-lc-text">{problem.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-lc-text-muted mb-3">{problem.reasonForRecommendation}</p>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                              {problem.topic}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary border border-gray-200 dark:border-lc-border-light flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{problem.estimatedTime} min
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartProblem(problem.slug)}
                          className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
                        >
                          <span>Solve</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Problem Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-lc-border">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-gray-200 dark:bg-lc-elevated rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-600 h-full rounded-full"
                              style={{ width: `${problem.acceptanceRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-lc-text-secondary whitespace-nowrap">
                            {problem.acceptanceRate}% accepted
                          </span>
                        </div>
                        <div className="text-right text-xs text-gray-600 dark:text-lc-text-muted">
                          <span className="font-medium">{problem.totalAttempts.toLocaleString()}</span> attempts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}

        {/* Motivational Card */}
        <Card className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-purple-50 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-lc-text mb-1">Keep Up The Great Work!</h3>
              <p className="text-sm text-gray-700 dark:text-lc-text-secondary">
                These recommendations are personalized based on your activity, performance, and learning patterns. 
                Complete them to fill knowledge gaps, build consistency, and accelerate your preparation!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default RecommendedProblemsPage;
