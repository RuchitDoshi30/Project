import { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Lock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';

/**
 * Student Management Page
 * 
 * Comprehensive interface for managing student accounts.
 * Features: CRUD operations, search/filter, account status management.
 */

// Student Interface
interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  enrollmentDate: string;
  status: 'active' | 'disabled';
  problemsSolved: number;
  testsCompleted: number;
  averageScore: number;
  lastActive: string;
}

// Mock Students Data
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@student.edu',
    studentId: 'ST2024001',
    enrollmentDate: '2024-01-15',
    status: 'active',
    problemsSolved: 12,
    testsCompleted: 5,
    averageScore: 78,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@student.edu',
    studentId: 'ST2024002',
    enrollmentDate: '2024-01-16',
    status: 'active',
    problemsSolved: 18,
    testsCompleted: 7,
    averageScore: 85,
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@student.edu',
    studentId: 'ST2024003',
    enrollmentDate: '2024-01-18',
    status: 'active',
    problemsSolved: 8,
    testsCompleted: 3,
    averageScore: 72,
    lastActive: '5 hours ago',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@student.edu',
    studentId: 'ST2024004',
    enrollmentDate: '2024-01-20',
    status: 'disabled',
    problemsSolved: 5,
    testsCompleted: 2,
    averageScore: 65,
    lastActive: '3 days ago',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@student.edu',
    studentId: 'ST2024005',
    enrollmentDate: '2024-01-22',
    status: 'active',
    problemsSolved: 15,
    testsCompleted: 6,
    averageScore: 82,
    lastActive: '30 minutes ago',
  },
  {
    id: '6',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@student.edu',
    studentId: 'ST2024006',
    enrollmentDate: '2024-01-25',
    status: 'active',
    problemsSolved: 10,
    testsCompleted: 4,
    averageScore: 75,
    lastActive: '4 hours ago',
  },
  {
    id: '7',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@student.edu',
    studentId: 'ST2024007',
    enrollmentDate: '2024-01-28',
    status: 'active',
    problemsSolved: 20,
    testsCompleted: 8,
    averageScore: 88,
    lastActive: '15 minutes ago',
  },
  {
    id: '8',
    name: 'Kavya Nair',
    email: 'kavya.nair@student.edu',
    studentId: 'ST2024008',
    enrollmentDate: '2024-02-01',
    status: 'active',
    problemsSolved: 6,
    testsCompleted: 2,
    averageScore: 68,
    lastActive: '1 day ago',
  },
];

const StudentManagementPage = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle delete student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  // Handle toggle status
  const handleToggleStatus = (id: string) => {
    setStudents(students.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'active' ? 'disabled' : 'active' } 
        : s
    ));
  };

  // Handle reset password
  const handleResetPassword = (student: Student) => {
    if (window.confirm(`Reset password for ${student.name}? A temporary password will be sent to ${student.email}.`)) {
      alert(`Password reset email sent to ${student.email}`);
    }
  };

  // Handle view student details
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    return status === 'active' 
      ? <CheckCircle className="w-4 h-4" /> 
      : <XCircle className="w-4 h-4" />;
  };

  return (
    <Container>
      <PageHeader
        title="Student Management"
        description="Manage student accounts, track progress, and control access"
      />

      {/* Actions Bar */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
              className="px-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>

            {/* Add Student Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add new student"
            >
              <UserPlus className="w-5 h-5" aria-hidden="true" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">👨‍🎓</span>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-2.5">
                <UserPlus className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{students.length}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Total Students</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-2.5">
                <CheckCircle className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {students.filter(s => s.status === 'active').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Active</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">⛔</span>
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-2.5">
                <XCircle className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {students.filter(s => s.status === 'disabled').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Disabled</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">👁️</span>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-2.5">
                <Eye className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{filteredStudents.length}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">Showing</p>
          </div>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-lc-border">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Student ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Avg Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Last Active</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-lc-text-muted">
                    No students found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 dark:border-lc-border hover:bg-gray-50 dark:hover:bg-lc-elevated">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-lc-text">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-lc-text-muted">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-lc-text-secondary">{student.studentId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700 dark:text-lc-text-secondary">
                          {student.problemsSolved} problems
                        </span>
                        <span className="text-sm text-gray-500 dark:text-lc-text-muted">
                          {student.testsCompleted} tests
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${
                        student.averageScore >= 80 
                          ? 'text-green-600' 
                          : student.averageScore >= 60 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {getStatusIcon(student.status)}
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-lc-text-muted">{student.lastActive}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                          aria-label={`View details for ${student.name}`}
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(student)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Reset Password"
                          aria-label={`Reset password for ${student.name}`}
                        >
                          <Lock className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            student.status === 'active'
                              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                          }`}
                          title={student.status === 'active' ? 'Disable Account' : 'Enable Account'}
                          aria-label={student.status === 'active' ? `Disable account for ${student.name}` : `Enable account for ${student.name}`}
                        >
                          {student.status === 'active' ? (
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <CheckCircle className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Student"
                          aria-label={`Delete student ${student.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal (Placeholder) */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-title"
        >
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 id="add-student-title" className="text-xl font-bold dark:text-lc-text mb-4">
              Add New Student
            </h3>
            <p className="text-gray-600 dark:text-lc-text-muted mb-4">Student creation form will be implemented here.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-student-title"
        >
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 id="view-student-title" className="text-2xl font-bold dark:text-lc-text mb-4">
              {selectedStudent.name}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Email</p>
                <p className="font-medium dark:text-lc-text">{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Student ID</p>
                <p className="font-medium font-mono dark:text-lc-text">{selectedStudent.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Enrollment Date</p>
                <p className="font-medium dark:text-lc-text">{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Status</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                  {getStatusIcon(selectedStudent.status)}
                  {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t dark:border-lc-border pt-4 mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-3">Performance Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedStudent.problemsSolved}</p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Problems Solved</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedStudent.testsCompleted}</p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Tests Completed</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedStudent.averageScore}%</p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Average Score</p>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-lc-border pt-4">
              <p className="text-sm text-gray-500 dark:text-lc-text-muted">Last Active: {selectedStudent.lastActive}</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  // Edit functionality to be implemented
                  alert('Edit functionality coming soon!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Student
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default StudentManagementPage;
