import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import type { AptitudeCategory, DifficultyLevel } from '../types/models';

/**
 * Add/Edit Aptitude Question Page
 * 
 * Comprehensive form for creating and editing aptitude questions.
 * Features: Multiple options, correct answer selection, explanation, validation, loading states.
 */

const AddAptitudeQuestionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form State
  const [category, setCategory] = useState<AptitudeCategory>('Quantitative');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Option Management
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // Form Submission
  const handleSubmit = async () => {
    // Validation
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (options.some(opt => !opt.trim())) {
      alert('Please fill in all options');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would call the API
    console.log('Question data:', {
      category,
      difficulty,
      question,
      options,
      correctAnswer,
      explanation,
    });

    setIsSubmitting(false);
    alert(`Question ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/admin/aptitude');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/aptitude')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEditMode ? 'Edit Question' : 'Add New Question'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update question details and options' : 'Create a new aptitude question for tests'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Details */}
            <Card className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900">Question Details</h2>
                <p className="text-sm text-gray-500 mt-1">Write your question and provide multiple choice options</p>
              </div>
              
              <div className="space-y-5">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., If a train travels 120 km in 2 hours, what is its average speed?"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Write a clear and unambiguous question</p>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <div className="flex items-center pt-2.5">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={correctAnswer === index}
                            onChange={() => setCorrectAnswer(index)}
                            className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {correctAnswer === index && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded uppercase tracking-wide">
                                Correct
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2.5">
                    💡 Click the radio button to mark the correct answer
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Explanation <span className="text-gray-400 text-[10px]">(OPTIONAL)</span>
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="e.g., Speed = Distance / Time = 120 km / 2 hours = 60 km/h"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Provide a detailed explanation to help students learn</p>
                </div>
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AptitudeCategory)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Quantitative">🔢 Quantitative</option>
                    <option value="Logical">🧩 Logical</option>
                    <option value="Verbal">📝 Verbal</option>
                    <option value="Technical">💻 Technical</option>
                  </select>
                </div>

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
                        {isEditMode ? 'Update' : 'Publish'} Question
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/admin/aptitude')}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Question Info</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Category</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    category === 'Quantitative' ? 'bg-blue-100 text-blue-700' :
                    category === 'Logical' ? 'bg-purple-100 text-purple-700' :
                    category === 'Verbal' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{category}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{difficulty}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Options</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">4</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Correct Answer</span>
                  <span className="font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                    {String.fromCharCode(65 + correctAnswer)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Has Explanation</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    explanation ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {explanation ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Guidelines */}
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-sm font-semibold text-amber-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span>💡</span> Best Practices
              </h3>
              <ul className="text-xs text-amber-900 space-y-2 leading-relaxed">
                <li className="flex gap-2"><span>•</span><span>Write clear, unambiguous questions</span></li>
                <li className="flex gap-2"><span>•</span><span>Make all options plausible</span></li>
                <li className="flex gap-2"><span>•</span><span>Provide detailed explanations</span></li>
                <li className="flex gap-2"><span>•</span><span>Avoid negative phrasing</span></li>
                <li className="flex gap-2"><span>•</span><span>Match difficulty with complexity</span></li>
              </ul>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddAptitudeQuestionPage;
