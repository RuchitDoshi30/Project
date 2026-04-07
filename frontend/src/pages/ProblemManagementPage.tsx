import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, Code, Filter } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import type { IProblem, DifficultyLevel } from '../types/models';
import { getProblems } from '../services/problems.service';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Problem Management Page
 * 
 * Comprehensive interface for managing coding problems.
 * Features: CRUD operations, difficulty filters, test case management.
 */

interface IProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface IExtendedProblem extends Omit<IProblem, 'constraints'> {
  examples?: IProblemExample[];
  constraints?: string | string[];
}

const ProblemManagementPage = () => {
  usePageTitle('Problem Management');
  const navigate = useNavigate();
  const [problems, setProblems] = useState<IExtendedProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');
  const [selectedProblem, setSelectedProblem] = useState<IExtendedProblem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getProblems({ limit: 500 });
        setProblems((result.data || []) as IExtendedProblem[]);
      } catch (e) {
        console.error('Failed to load problems', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  // Handle delete problem
  const handleDeleteProblem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      try {
        const { api: apiClient } = await import('../services/api.client');
        await apiClient.delete(`/problems/${id}`);
        setProblems(problems.filter(p => p._id !== id));
        alert('Problem deleted successfully');
      } catch (e) {
        console.error('Failed to delete problem', e);
        alert('Failed to delete problem');
      }
    }
  };

  // Handle view problem
  const handleViewProblem = (problem: IExtendedProblem) => {
    setSelectedProblem(problem);
    setShowViewModal(true);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-lc-elevated text-gray-800 dark:text-lc-text-secondary';
    }
  };

  if (loading) {
    return (
      <Container>
        <PageHeader title="Problem Management" description="Manage coding problems, test cases, and difficulty levels" />
        <div className="space-y-4">{[1,2,3].map(i => (<Card key={i} className="p-4 animate-pulse"><div className="h-24 bg-gray-200 dark:bg-lc-elevated rounded"></div></Card>))}</div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Problem Management"
        description="Manage coding problems, test cases, and difficulty levels"
      />

      {/* Actions Bar */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by title, slug, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-4">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" aria-hidden="true" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as 'all' | DifficultyLevel)}
                className="px-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Add Problem Button */}
            <button
              onClick={() => navigate('/admin/problems/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add new problem"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Add Problem</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Code className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{problems.length}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Total Problems</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {problems.filter(p => p.difficulty === 'Beginner').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Beginner</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-all duration-300">
          <div className="text-center">
            <div className="text-3xl mb-2">🟡</div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {problems.filter(p => p.difficulty === 'Intermediate').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Intermediate</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="text-center">
            <div className="text-3xl mb-2">🔴</div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {problems.filter(p => p.difficulty === 'Advanced').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Advanced</p>
          </div>
        </Card>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProblems.length === 0 ? (
          <Card className="col-span-full">
            <div className="text-center py-12 text-gray-500 dark:text-lc-text-muted">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" aria-hidden="true" />
              <p className="text-lg font-medium">No problems found</p>
              <p className="text-sm">Try changing your search or filter criteria</p>
            </div>
          </Card>
        ) : (
          filteredProblems.map((problem) => (
            <Card key={problem._id} className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-500">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Code className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-lc-text">
                        {problem.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(problem.difficulty)} shadow-sm`}>
                        {problem.difficulty === 'Beginner' ? '🟢' : problem.difficulty === 'Intermediate' ? '🟡' : '🔴'} {problem.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-lc-text-muted font-mono bg-gray-100 dark:bg-lc-elevated px-2 py-1 rounded">/{problem.slug}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-700 hover:shadow-sm transition-shadow"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Description Preview */}
                <p className="text-sm text-gray-600 dark:text-lc-text-muted line-clamp-2">
                  {problem.description.split('\n')[0]}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-lc-text-muted border-t dark:border-lc-border pt-3">
                  <div>
                    <span className="font-medium">Examples:</span> {problem.examples?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Test Cases:</span> {problem.testCases?.length || 0}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t dark:border-lc-border pt-3">
                  <button
                    onClick={() => handleViewProblem(problem)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/problems/edit/${problem._id}`)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-lc-border-light transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(problem._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ml-auto"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* View Problem Modal */}
      {showViewModal && selectedProblem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-problem-title"
        >
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  id="view-problem-title"
                  className="text-2xl font-bold dark:text-lc-text mb-2"
                >
                  {selectedProblem.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-lc-text-muted font-mono">/{selectedProblem.slug}</span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 dark:text-lc-text-muted hover:text-gray-700 dark:hover:text-lc-text"
                aria-label="Close problem details"
              >
                ×
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProblem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-2">Description</h4>
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-lc-text-secondary whitespace-pre-wrap">
                {selectedProblem.description}
              </div>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-3">Examples ({selectedProblem.examples?.length || 0})</h4>
              <div className="space-y-4">
                {selectedProblem.examples && selectedProblem.examples.length > 0 ? (
                  selectedProblem.examples.map((example: IProblemExample, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-lc-elevated p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary mb-2">Example {index + 1}:</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium dark:text-lc-text-secondary">Input:</span>
                        <code className="ml-2 text-blue-600 dark:text-blue-400">{example.input}</code>
                      </div>
                      <div>
                        <span className="font-medium dark:text-lc-text-secondary">Output:</span>
                        <code className="ml-2 text-green-600 dark:text-green-400">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="font-medium dark:text-lc-text-secondary">Explanation:</span>
                          <span className="ml-2 text-gray-600 dark:text-lc-text-muted">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-lc-text-muted">No examples available</p>
                )}
              </div>
            </div>

            {/* Constraints */}
            <div className="mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-3">Constraints</h4>
              {selectedProblem.constraints && Array.isArray(selectedProblem.constraints) && selectedProblem.constraints.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-lc-text-secondary">
                  {selectedProblem.constraints.map((constraint: string, index: number) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">{typeof selectedProblem.constraints === 'string' ? selectedProblem.constraints : 'No constraints specified'}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t dark:border-lc-border pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/admin/problems/edit/${selectedProblem._id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProblemManagementPage;
