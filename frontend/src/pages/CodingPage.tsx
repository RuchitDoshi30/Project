import { useState, useMemo } from 'react';
import { Container, PageHeader, Card } from '../components';
import { Code2, Search, Filter, CheckCircle, Circle, Clock } from 'lucide-react';
import { getProblemsWithStatus, getAllTags } from '../services/problems.service';

type SortOption = 'title' | 'difficulty' | 'time';
type SortOrder = 'asc' | 'desc';

const CodingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const userId = '2'; // Mock user ID
  const allProblems = getProblemsWithStatus(userId);
  const allTags = getAllTags();
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['Unsolved', 'Attempted', 'Solved'];

  // Advanced filtering and sorting
  const filteredProblems = useMemo(() => {
    let filtered = allProblems;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Difficulty filter (multi-select)
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(p => selectedDifficulties.includes(p.difficulty));
    }

    // Tags filter (multi-select)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(p => {
        const status = p.progress.status;
        return selectedStatuses.some(s => s.toLowerCase() === status);
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty': {
          const diffOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
          break;
        }
        case 'time':
          comparison = a.progress.timeSpent - b.progress.timeSpent;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allProblems, searchQuery, selectedDifficulties, selectedTags, selectedStatuses, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'attempted':
        return <Circle className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const hasActiveFilters = 
    selectedDifficulties.length > 0 || 
    selectedTags.length > 0 || 
    selectedStatuses.length > 0 || 
    searchQuery;

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="Coding Problems"
        description="Practice problem-solving and improve your coding skills"
      />

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-lc-text-muted" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-lc-text-muted"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [option, order] = e.target.value.split('_');
              setSortBy(option as SortOption);
              setSortOrder(order as SortOrder);
            }}
            className="px-4 py-2.5 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-700 dark:text-lc-text-secondary rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-lc-elevated focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="difficulty_asc">Difficulty (Easy first)</option>
            <option value="difficulty_desc">Difficulty (Hard first)</option>
            <option value="time_asc">Time Spent (Low to High)</option>
            <option value="time_desc">Time Spent (High to Low)</option>
          </select>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-lc-card border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-primary-600 rounded text-xs font-semibold">
                {selectedDifficulties.length + selectedTags.length + selectedStatuses.length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedStatuses.includes(status)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => toggleDifficulty(difficulty)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedDifficulties.includes(difficulty)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Topics</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 dark:from-lc-card to-blue-50 dark:to-blue-900/20">
            <Code2 className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No problems found</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Try adjusting your filters or search query</p>
          </Card>
        ) : (
          filteredProblems.map((problem) => (
            <Card key={problem._id} className="p-4 border-l-4 border-l-blue-500 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-gradient-to-r from-white dark:from-lc-card to-blue-50/30 dark:to-blue-900/10">
              <a
                href={`/coding/${problem.slug}`}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(problem.progress.status)}
                </div>

                {/* Problem Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {problem.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      problem.difficulty === 'Beginner' ? 'bg-gradient-to-r from-green-100 dark:from-green-900/40 to-emerald-100 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' :
                      problem.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-yellow-100 dark:from-yellow-900/40 to-orange-100 dark:to-orange-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700' :
                      'bg-gradient-to-r from-red-100 dark:from-red-900/40 to-pink-100 dark:to-pink-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                    }`}>
                      {problem.difficulty === 'Beginner' ? '🟢' : problem.difficulty === 'Intermediate' ? '🟡' : '🔴'} {problem.difficulty}
                    </span>
                    {problem.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-lc-text-muted sm:flex-shrink-0">
                  {problem.progress.timeSpent > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(problem.progress.timeSpent)}</span>
                    </div>
                  )}
                </div>
              </a>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      {filteredProblems.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-lc-text-muted">
          Showing {filteredProblems.length} {filteredProblems.length === 1 ? 'problem' : 'problems'}
        </div>
      )}
    </Container>
  );
};

export default CodingPage;
