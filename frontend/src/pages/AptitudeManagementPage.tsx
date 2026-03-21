import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, FileQuestion, Filter } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import type { IAptitudeQuestion, AptitudeCategory } from '../types/models';
import { api } from '../services/api.client';
import toast from 'react-hot-toast';

/**
 * Aptitude Management Page
 * 
 * Comprehensive interface for managing aptitude questions.
 * Features: CRUD operations, category filters, option management.
 */

const AptitudeManagementPage = () => {
  const navigate = useNavigate();
  // Get all questions from API
  const [questions, setQuestions] = useState<IAptitudeQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await api.get<{ success: boolean; data: IAptitudeQuestion[] }>('/aptitude/questions?limit=100');
        setQuestions(response.data);
      } catch (e) {
        console.error('Failed to load questions', e);
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AptitudeCategory>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<IAptitudeQuestion | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<AptitudeCategory>>(new Set());
  const [categoryPages, setCategoryPages] = useState<Record<AptitudeCategory, number>>({
    'Quantitative': 1,
    'Logical': 1,
    'Verbal': 1,
    'Technical': 1
  });

  const QUESTIONS_PER_PAGE = 10;

  // Toggle category expansion
  const toggleCategory = (category: AptitudeCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
        // Reset to page 1 when expanding
        setCategoryPages(prevPages => ({ ...prevPages, [category]: 1 }));
      }
      return newSet;
    });
  };

  // Change page for a category
  const changePage = (category: AptitudeCategory, newPage: number) => {
    setCategoryPages(prev => ({ ...prev, [category]: newPage }));
  };

  // Group questions by category
  const groupedQuestions = {
    'Quantitative': questions.filter(q => q.category === 'Quantitative'),
    'Logical': questions.filter(q => q.category === 'Logical'),
    'Verbal': questions.filter(q => q.category === 'Verbal'),
    'Technical': questions.filter(q => q.category === 'Technical')
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || question.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle delete question
  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await api.delete(`/aptitude/questions/${id}`);
        setQuestions(questions.filter(q => q._id !== id));
        toast.success('Question deleted successfully');
      } catch (e) {
        console.error('Failed to delete question', e);
        toast.error('Failed to delete question');
      }
    }
  };

  // Handle view question
  const handleViewQuestion = (question: IAptitudeQuestion) => {
    setSelectedQuestion(question);
    setShowViewModal(true);
  };

  // Get category badge color
  const getCategoryColor = (category: AptitudeCategory) => {
    switch (category) {
      case 'Quantitative':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Logical':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'Verbal':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Technical':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-lc-elevated text-gray-800 dark:text-lc-text-secondary';
    }
  };

  if (loading) {
    return (
      <Container>
        <PageHeader title="Aptitude Question Management" description="Manage aptitude questions, categories, and test configurations" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-lc-elevated rounded"></div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Aptitude Question Management"
        description="Manage aptitude questions, categories, and test configurations"
      />

      {/* Actions Bar */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by question or options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | AptitudeCategory)}
                className="px-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Quantitative">Quantitative</option>
                <option value="Logical">Logical</option>
                <option value="Verbal">Verbal</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            {/* Add Question Button */}
            <button
              onClick={() => navigate('/admin/aptitude/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">🧠</span>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-2.5">
                <FileQuestion className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{questions.length}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Total Questions</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <span className="text-2xl mb-2 inline-block">🔢</span>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {questions.filter(q => q.category === 'Quantitative').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Quantitative</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <span className="text-2xl mb-2 inline-block">🧩</span>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {questions.filter(q => q.category === 'Logical').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Logical</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <span className="text-2xl mb-2 inline-block">💬</span>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {questions.filter(q => q.category === 'Verbal').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Verbal</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <span className="text-2xl mb-2 inline-block">⚙️</span>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {questions.filter(q => q.category === 'Technical').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Technical</p>
          </div>
        </Card>
      </div>

      {/* Questions List - Category Accordion */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500 dark:text-lc-text-muted">
              <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No questions found</p>
              <p className="text-sm">Try changing your search or filter criteria</p>
            </div>
          </Card>
        ) : searchQuery ? (
          // Show flat list when searching
          filteredQuestions.map((question, index) => (
            <Card key={question._id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold text-gray-500">Q{index + 1}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                        {question.category}
                      </span>
                    </div>
                    <p className="text-base text-gray-900 dark:text-lc-text mb-4 leading-relaxed">
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border-2 ${optIndex === question.correctOptionIndex
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-200 dark:border-lc-border-light bg-gray-50 dark:bg-lc-elevated'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 dark:text-lc-text-secondary min-w-[24px]">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span className="text-gray-900 dark:text-lc-text">{option}</span>
                        {optIndex === question.correctOptionIndex && (
                          <span className="ml-auto text-xs font-medium text-green-700 dark:text-green-400">✓ Correct</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation Preview */}
                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 line-clamp-2">{question.explanation}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 border-t dark:border-lc-border pt-3">
                  <button
                    onClick={() => handleViewQuestion(question)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/aptitude/edit/${question._id}`)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-lc-border-light transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Show category accordion when not searching
          (['Quantitative', 'Logical', 'Verbal', 'Technical'] as AptitudeCategory[]).map(category => {
            const categoryQuestions = categoryFilter === 'all'
              ? groupedQuestions[category]
              : categoryFilter === category
                ? groupedQuestions[category]
                : [];

            if (categoryQuestions.length === 0 && categoryFilter !== 'all') return null;

            const isExpanded = expandedCategories.has(category);
            const categoryColors = {
              'Quantitative': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100' },
              'Logical': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100' },
              'Verbal': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100' },
              'Technical': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100' }
            };
            const colors = categoryColors[category];

            return (
              <Card key={category} className={`${colors.border} border-2`}>
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${colors.bg} ${colors.border} border-2 rounded-lg flex items-center justify-center`}>
                      <FileQuestion className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="text-left">
                      <h3 className={`text-lg font-bold ${colors.text}`}>{category}</h3>
                      <p className="text-sm text-gray-500 dark:text-lc-text-muted">
                        {categoryQuestions.length} question{categoryQuestions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`${colors.badge} ${colors.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                      {categoryQuestions.length}
                    </span>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Category Questions - Expandable */}
                {isExpanded && (
                  <div className={`border-t ${colors.border} p-4 space-y-3 ${colors.bg}`}>
                    {(() => {
                      const currentPage = categoryPages[category];
                      const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
                      const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
                      const endIndex = startIndex + QUESTIONS_PER_PAGE;
                      const paginatedQuestions = categoryQuestions.slice(startIndex, endIndex);

                      return (
                        <>
                          {paginatedQuestions.map((question, index) => (
                            <div key={question._id} className="bg-white dark:bg-lc-card rounded-lg p-4 shadow-sm border border-gray-200 dark:border-lc-border">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-gray-500 dark:text-lc-text-muted">Q{index + 1}</span>
                                  <p className="text-sm text-gray-900 dark:text-lc-text line-clamp-2 flex-1">{question.question}</p>
                                </div>
                              </div>

                              {/* Compact Options */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-2 rounded text-xs border ${optIndex === question.correctOptionIndex
                                        ? 'border-green-300 bg-green-50 text-green-800'
                                        : 'border-gray-200 bg-gray-50 text-gray-700'
                                      }`}
                                  >
                                    <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                  </div>
                                ))}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewQuestion(question)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/aptitude/edit/${question._id}`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-lc-border-light transition-colors text-xs"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs ml-auto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-lc-border bg-white dark:bg-lc-card rounded-lg p-3">
                              <div className="text-sm text-gray-600 dark:text-lc-text-muted">
                                Showing {startIndex + 1}-{Math.min(endIndex, categoryQuestions.length)} of {categoryQuestions.length} questions
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => changePage(category, currentPage - 1)}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Previous
                                </button>

                                <div className="flex items-center gap-1">
                                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => changePage(category, pageNum)}
                                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                            ? `${colors.badge} ${colors.text}`
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                          }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={() => changePage(category, currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary bg-white dark:bg-lc-elevated border border-gray-300 dark:border-lc-border-light rounded-lg hover:bg-gray-50 dark:hover:bg-lc-border-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* View Question Modal */}
      {showViewModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedQuestion.category)}`}>
                  {selectedQuestion.category}
                </span>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 dark:text-lc-text-muted hover:text-gray-700 dark:hover:text-lc-text"
              >
                ×
              </button>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-2">Question:</h4>
              <p className="text-lg text-gray-900 dark:text-lc-text leading-relaxed">{selectedQuestion.question}</p>
            </div>

            {/* Options */}
            <div className="mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-3">Options:</h4>
              <div className="space-y-3">
                {selectedQuestion.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-4 rounded-lg border-2 ${optIndex === selectedQuestion.correctOptionIndex
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/30 dark:border-green-600'
                        : 'border-gray-200 dark:border-lc-border-light bg-gray-50 dark:bg-lc-elevated'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 dark:text-lc-text-secondary min-w-[32px]">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span className="flex-1 text-gray-900 dark:text-lc-text">{option}</span>
                      {optIndex === selectedQuestion.correctOptionIndex && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {selectedQuestion.explanation && (
              <div className="mb-6">
                <h4 className="font-semibold dark:text-lc-text mb-2">Explanation:</h4>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-lc-text leading-relaxed">{selectedQuestion.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t dark:border-lc-border pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/admin/aptitude/edit/${selectedQuestion._id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AptitudeManagementPage;
