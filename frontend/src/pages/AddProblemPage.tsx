import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Loader2 } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import type { DifficultyLevel } from '../types/models';

/**
 * Add/Edit Problem Page
 * 
 * Comprehensive form for creating and editing coding problems.
 * Features: Rich text editor, test cases, examples, tags management, validation.
 */

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

const AddProblemPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [constraints, setConstraints] = useState('');
  const [examples, setExamples] = useState<Example[]>([
    { input: '', output: '', explanation: '' }
  ]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', isHidden: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditMode) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  // Tag Management
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Example Management
  const handleAddExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (index: number, field: keyof Example, value: string) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };

  // Test Case Management
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string | boolean) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  // Form Submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || !slug.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would call the API
    console.log('Problem data:', {
      title,
      slug,
      difficulty,
      description,
      tags,
      constraints,
      examples,
      testCases,
    });

    setIsSubmitting(false);
    alert(`Problem ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/admin/problems');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/problems')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEditMode ? 'Edit Problem' : 'Add New Problem'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update problem details and test cases' : 'Create a new coding problem for students'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500 mt-1">General details about the problem</p>
              </div>
              
              <div className="space-y-5">
                {/* Title & Slug in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Problem Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Two Sum"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g., two-sum"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the problem clearly. Include what the input/output should be and any special conditions..."
                    rows={6}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Write a clear and detailed problem statement</p>
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Constraints
                  </label>
                  <textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="• 2 ≤ nums.length ≤ 10⁴&#10;• -10⁹ ≤ nums[i] ≤ 10⁹"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">One constraint per line (optional)</p>
                </div>
              </div>
            </Card>

            {/* Examples */}
            <Card className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Examples</h2>
                  <p className="text-sm text-gray-500 mt-1">Provide sample inputs and outputs to illustrate the problem</p>
                </div>
                <button
                  onClick={handleAddExample}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Example
                </button>
              </div>

              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Example {index + 1}</span>
                      <button
                        onClick={() => handleRemoveExample(index)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Input</label>
                        <textarea
                          value={example.input}
                          onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                          placeholder="nums = [2,7,11,15]&#10;target = 9"
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Output</label>
                        <textarea
                          value={example.output}
                          onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                          placeholder="[0,1]"
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Explanation</label>
                      <textarea
                        value={example.explanation}
                        onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                        placeholder="nums[0] + nums[1] == 9, so we return [0, 1]"
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Test Cases */}
            <Card className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Test Cases</h2>
                  <p className="text-sm text-gray-500 mt-1">Define test cases to validate student solutions</p>
                </div>
                <button
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Test
                </button>
              </div>

              <div className="space-y-3">
                {testCases.map((testCase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Test {index + 1}</span>
                        {testCase.isHidden && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Hidden</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveTestCase(index)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Input</label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          placeholder="[2,7,11,15]&#10;9"
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected Output</label>
                        <textarea
                          value={testCase.expectedOutput}
                          onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                          placeholder="[0,1]"
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono bg-white"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      Hide from students (private test case)
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Sticky */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Publish Settings */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Beginner">🟢 Beginner</option>
                    <option value="Intermediate">🟡 Intermediate</option>
                    <option value="Advanced">🔴 Advanced</option>
                  </select>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? 'Update' : 'Publish'} Problem
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/admin/problems')}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Tags</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">No tags added yet</p>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Summary</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Examples</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{examples.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Test Cases</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{testCases.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Tags</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{tags.length}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {difficulty}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddProblemPage;
