import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Container } from '../components/Container';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { api } from '../services/api.client';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Student Management Page
 *
 * Comprehensive interface for managing student accounts.
 * Features: CRUD operations, search/filter, account status management.
 */

// Student Interface
interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: number;
  section: string;
  enrollmentDate: string;
  status: 'active' | 'disabled';
  problemsSolved: number;
  testsCompleted: number;
  averageScore: number;
  lastActive: string;
}

interface CsvRow {
  lineNumber: number;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: string;
  section: string;
  errors: string[];
}

interface ImportSummary {
  totalRows: number;
  successfulInserts: number;
  skippedRows: number;
  errors: { lineNumber: number; reason: string }[];
  generatedCredentials: {
    rollNumber: string;
    email: string;
    temporaryPassword: string;
  }[];
}

const allowedDepartments = ['CE', 'IT', 'CSE', 'EC', 'ME', 'CV'] as const;

const StudentManagementPage = () => {
  usePageTitle('Student Management');
  const navigate = useNavigate();
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const mapApiStudent = (s: any): Student => ({
    id: s._id || s.id,
    rollNumber: s.universityId || '',
    name: s.name,
    email: s.email,
    department: s.branch || 'N/A',
    year: Math.ceil((s.semester || 1) / 2),
    section: 'A',
    enrollmentDate: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : 'N/A',
    status: s.accountStatus === 'active' ? 'active' : 'disabled',
    problemsSolved: 0,
    testsCompleted: 0,
    averageScore: 0,
    lastActive: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : 'N/A',
  });

  const loadStudents = async (cursor?: string | null, search?: string) => {
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (cursor) params.append('cursor', cursor);
      if (search) params.append('search', search);
      const response = await api.get<{ success: boolean; data: any[]; nextCursor: string | null; hasMore: boolean }>(`/dashboard/students?${params.toString()}`);
      const mapped = response.data.map(mapApiStudent);
      if (cursor) {
        setStudents(prev => [...prev, ...mapped]);
      } else {
        setStudents(mapped);
      }
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (e) {
      console.error('Failed to load students', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    loadStudents(nextCursor, searchQuery);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<
    'all' | (typeof allowedDepartments)[number]
  >('all');
  const [yearFilter, setYearFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: 'CE',
    year: '1',
    section: 'A',
  });

  const parseCsv = (csvText: string): CsvRow[] => {
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error('CSV should include a header row and at least one data row');
    }

    const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
    const requiredHeaders = ['roll_number', 'name', 'email', 'department', 'year', 'section'];

    const missingHeaders = requiredHeaders.filter((required) => !headers.includes(required));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const headerIndex = {
      rollNumber: headers.indexOf('roll_number'),
      name: headers.indexOf('name'),
      email: headers.indexOf('email'),
      department: headers.indexOf('department'),
      year: headers.indexOf('year'),
      section: headers.indexOf('section'),
    };

    const existingRollSet = new Set(students.map((student) => student.rollNumber.toLowerCase()));
    const existingEmailSet = new Set(students.map((student) => student.email.toLowerCase()));

    const rows = lines.slice(1).map((line, rowIndex) => {
      const columns = line.split(',').map((column) => column.trim());
      return {
        lineNumber: rowIndex + 2,
        rollNumber: columns[headerIndex.rollNumber] ?? '',
        name: columns[headerIndex.name] ?? '',
        email: columns[headerIndex.email] ?? '',
        department: (columns[headerIndex.department] ?? '').toUpperCase(),
        year: columns[headerIndex.year] ?? '',
        section: (columns[headerIndex.section] ?? '').toUpperCase(),
        errors: [],
      } satisfies CsvRow;
    });

    const rollFrequency = new Map<string, number>();
    const emailFrequency = new Map<string, number>();

    rows.forEach((row) => {
      const normalizedRoll = row.rollNumber.toLowerCase();
      const normalizedEmail = row.email.toLowerCase();
      if (normalizedRoll) {
        rollFrequency.set(normalizedRoll, (rollFrequency.get(normalizedRoll) || 0) + 1);
      }
      if (normalizedEmail) {
        emailFrequency.set(normalizedEmail, (emailFrequency.get(normalizedEmail) || 0) + 1);
      }
    });

    return rows.map((row) => {
      const errors: string[] = [];

      if (
        !row.rollNumber ||
        !row.name ||
        !row.email ||
        !row.department ||
        !row.year ||
        !row.section
      ) {
        errors.push('Missing required fields');
      }

      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push('Invalid email format');
      }

      if (
        row.department &&
        !allowedDepartments.includes(row.department as (typeof allowedDepartments)[number])
      ) {
        errors.push('Invalid department');
      }

      const yearNumber = Number(row.year);
      if (row.year && (Number.isNaN(yearNumber) || yearNumber < 1 || yearNumber > 4)) {
        errors.push('Invalid year');
      }

      const normalizedRoll = row.rollNumber.toLowerCase();
      const normalizedEmail = row.email.toLowerCase();

      if (normalizedRoll && (rollFrequency.get(normalizedRoll) || 0) > 1) {
        errors.push('Duplicate roll number in CSV');
      }

      if (normalizedEmail && (emailFrequency.get(normalizedEmail) || 0) > 1) {
        errors.push('Duplicate email in CSV');
      }

      if (normalizedRoll && existingRollSet.has(normalizedRoll)) {
        errors.push('Duplicate roll number in system');
      }

      if (normalizedEmail && existingEmailSet.has(normalizedEmail)) {
        errors.push('Duplicate email in system');
      }

      return { ...row, errors };
    });
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
    let password = '';
    for (let index = 0; index < 10; index += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    try {
      const text = await file.text();
      const parsedRows = parseCsv(text);
      setCsvRows(parsedRows);
      setCsvFileName(file.name);
      setImportSummary(null);

      const invalidCount = parsedRows.filter((row) => row.errors.length > 0).length;
      if (invalidCount > 0) {
        toast.error(
          `Parsed ${parsedRows.length} rows. ${invalidCount} row(s) need fixes or will be skipped.`,
        );
      } else {
        toast.success(`Parsed ${parsedRows.length} rows successfully.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV file';
      toast.error(message);
      setCsvRows([]);
      setCsvFileName('');
    } finally {
      event.target.value = '';
    }
  };

  const handleConfirmImport = () => {
    const validRows = csvRows.filter((row) => row.errors.length === 0);
    const invalidRows = csvRows.filter((row) => row.errors.length > 0);

    if (validRows.length === 0) {
      toast.error('No valid rows to import. Please fix the CSV and try again.');
      return;
    }

    const generatedCredentials = validRows.map((row) => ({
      rollNumber: row.rollNumber,
      email: row.email,
      temporaryPassword: generateTemporaryPassword(),
    }));

    const importedStudents: Student[] = validRows.map((row, index) => ({
      id: `imported-${Date.now()}-${index}`,
      rollNumber: row.rollNumber,
      name: row.name,
      email: row.email,
      department: row.department,
      year: Number(row.year),
      section: row.section,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      problemsSolved: 0,
      testsCompleted: 0,
      averageScore: 0,
      lastActive: 'Just added',
    }));

    setStudents((prev) => [...importedStudents, ...prev]);

    setImportSummary({
      totalRows: csvRows.length,
      successfulInserts: validRows.length,
      skippedRows: invalidRows.length,
      errors: invalidRows.map((row) => ({
        lineNumber: row.lineNumber,
        reason: row.errors.join(', '),
      })),
      generatedCredentials,
    });

    setShowImportConfirm(false);
    setCsvRows([]);
    setCsvFileName('');
    toast.success(`Imported ${validRows.length} students successfully.`);
  };

  const handleManualAddStudent = () => {
    const rollNumber = manualForm.rollNumber.trim().toUpperCase();
    const name = manualForm.name.trim();
    const email = manualForm.email.trim().toLowerCase();
    const department = manualForm.department.trim().toUpperCase();
    const year = Number(manualForm.year);
    const section = manualForm.section.trim().toUpperCase();

    if (!rollNumber || !name || !email || !department || !manualForm.year || !section) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (!allowedDepartments.includes(department as (typeof allowedDepartments)[number])) {
      toast.error('Please select a valid department');
      return;
    }

    if (Number.isNaN(year) || year < 1 || year > 4) {
      toast.error('Year must be between 1 and 4');
      return;
    }

    if (students.some((student) => student.rollNumber.toLowerCase() === rollNumber.toLowerCase())) {
      toast.error('Roll number already exists');
      return;
    }

    if (students.some((student) => student.email.toLowerCase() === email)) {
      toast.error('Email already exists');
      return;
    }

    const newStudent: Student = {
      id: `manual-${Date.now()}`,
      rollNumber,
      name,
      email,
      department,
      year,
      section,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      problemsSolved: 0,
      testsCompleted: 0,
      averageScore: 0,
      lastActive: 'Just added',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setManualForm({
      rollNumber: '',
      name: '',
      email: '',
      department: 'CE',
      year: '1',
      section: 'A',
    });
    setShowManualAddModal(false);
    toast.success('Student added manually');
  };

  // Debounce search: re-fetch from server when searchQuery changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      loadStudents(null, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Client-side filters for department/year/status (these are small enough to filter locally)
  const filteredStudents = students.filter((student) => {
    const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
    const matchesYear = yearFilter === 'all' || String(student.year) === yearFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesDepartment && matchesYear && matchesStatus;
  });

  // Handle delete student
  const handleDeleteStudent = async (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this student? This action cannot be undone.')
    ) {
      try {
        await api.delete(`/dashboard/students/${id}`);
        setStudents(students.filter((s) => s.id !== id));
        toast.success('Student deleted');
      } catch (e) {
        console.error('Failed to delete student', e);
        toast.error('Failed to delete student');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/dashboard/students/${id}/toggle-status`);
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, status: s.status === 'active' ? 'disabled' : 'active' } : s,
        ),
      );
      toast.success('Status updated');
    } catch (e) {
      console.error('Failed to toggle status', e);
      toast.error('Failed to update status');
    }
  };

  // Handle reset password
  const handleResetPassword = (student: Student) => {
    if (
      window.confirm(
        `Reset password for ${student.name}? A temporary password will be sent to ${student.email}.`,
      )
    ) {
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
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );
  };

  return (
    <Container>
      <PageHeader
        title="Student Management"
        description="Manage student accounts, track progress, and control access"
      />

      <input
        ref={csvFileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvFileChange}
        className="hidden"
      />

      {/* Actions Bar */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-lc-text">
                Primary Onboarding: Bulk CSV Import
              </p>
              <p className="text-xs text-gray-600 dark:text-lc-text-muted">
                Import thousands of students quickly. Use manual add only for late admissions,
                missing students, or corrections.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => csvFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Students (CSV)
              </button>
              <button
                onClick={() => setShowManualAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Student Manually
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search by roll number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value as 'all' | (typeof allowedDepartments)[number])
              }
              className="px-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {allowedDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value as 'all' | '1' | '2' | '3' | '4')}
              className="px-4 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

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
          </div>
        </div>
      </Card>

      {csvRows.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-lc-text flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                CSV Preview
              </h3>
              <p className="text-xs text-gray-600 dark:text-lc-text-muted">
                File: {csvFileName} • {csvRows.length} rows parsed
              </p>
            </div>
            <button
              onClick={() => setShowImportConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Confirm Import
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-lc-border">
                  <th className="text-left py-2 px-3">Line</th>
                  <th className="text-left py-2 px-3">Roll</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Dept</th>
                  <th className="text-left py-2 px-3">Year</th>
                  <th className="text-left py-2 px-3">Section</th>
                  <th className="text-left py-2 px-3">Validation</th>
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 15).map((row) => (
                  <tr
                    key={row.lineNumber}
                    className="border-b border-gray-100 dark:border-lc-border"
                  >
                    <td className="py-2 px-3">{row.lineNumber}</td>
                    <td className="py-2 px-3 font-mono">{row.rollNumber}</td>
                    <td className="py-2 px-3">{row.name}</td>
                    <td className="py-2 px-3">{row.email}</td>
                    <td className="py-2 px-3">{row.department}</td>
                    <td className="py-2 px-3">{row.year}</td>
                    <td className="py-2 px-3">{row.section}</td>
                    <td className="py-2 px-3">
                      {row.errors.length === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                          <CheckCircle className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs">
                          <AlertTriangle className="w-3 h-3" /> {row.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {csvRows.length > 15 && (
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mt-3">
              Showing first 15 rows for preview. All rows will be processed during import.
            </p>
          )}
        </Card>
      )}

      {importSummary && (
        <Card className="mb-6 border-green-200">
          <h3 className="text-base font-semibold text-gray-900 dark:text-lc-text mb-4">
            Import Result Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-lc-elevated rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-lc-text-muted">Total Rows</p>
              <p className="text-xl font-bold text-gray-900 dark:text-lc-text">
                {importSummary.totalRows}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-xs text-green-700 dark:text-green-300">Successful</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {importSummary.successfulInserts}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Skipped</p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                {importSummary.skippedRows}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">Credentials</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {importSummary.generatedCredentials.length}
              </p>
            </div>
          </div>

          {importSummary.errors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                Skipped Row Errors
              </p>
              <div className="max-h-40 overflow-y-auto border border-red-200 dark:border-red-800 rounded-lg">
                {importSummary.errors.map((error) => (
                  <div
                    key={`${error.lineNumber}-${error.reason}`}
                    className="text-xs px-3 py-2 border-b border-red-100 dark:border-red-900 text-red-700 dark:text-red-300"
                  >
                    Line {error.lineNumber}: {error.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

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
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {students.length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">
              Total Students
            </p>
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
              {students.filter((s) => s.status === 'active').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">
              Active
            </p>
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
              {students.filter((s) => s.status === 'disabled').length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">
              Disabled
            </p>
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
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {filteredStudents.length}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted uppercase tracking-wide">
              Showing
            </p>
          </div>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-lc-border">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Roll Number
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Department
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Year / Section
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Progress
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Avg Score
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Last Active
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-lc-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8 text-gray-500 dark:text-lc-text-muted"
                  >
                    No students found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 dark:border-lc-border hover:bg-gray-50 dark:hover:bg-lc-elevated"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-lc-text">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-lc-text-muted">
                          {student.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-lc-text-secondary">
                        {student.rollNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-lc-text-secondary font-medium">
                        {student.department}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-lc-text-secondary">
                        Year {student.year} • {student.section}
                      </span>
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
                      <span
                        className={`font-semibold ${
                          student.averageScore >= 80
                            ? 'text-green-600'
                            : student.averageScore >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                      >
                        {getStatusIcon(student.status)}
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-lc-text-muted">
                        {student.lastActive}
                      </span>
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
                          aria-label={
                            student.status === 'active'
                              ? `Disable account for ${student.name}`
                              : `Enable account for ${student.name}`
                          }
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

      {/* Load More */}
      {loading ? (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-lc-elevated rounded"></div>
            </Card>
          ))}
        </div>
      ) : hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loadingMore ? 'Loading...' : 'Load More Students'}
          </button>
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
                <p className="font-medium font-mono dark:text-lc-text">
                  {selectedStudent.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Department</p>
                <p className="font-medium dark:text-lc-text">{selectedStudent.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Enrollment Date</p>
                <p className="font-medium dark:text-lc-text">
                  {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Year / Section</p>
                <p className="font-medium dark:text-lc-text">
                  Year {selectedStudent.year} • {selectedStudent.section}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted">Status</p>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}
                >
                  {getStatusIcon(selectedStudent.status)}
                  {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t dark:border-lc-border pt-4 mb-6">
              <h4 className="font-semibold dark:text-lc-text mb-3">Performance Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedStudent.problemsSolved}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Problems Solved</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedStudent.testsCompleted}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Tests Completed</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedStudent.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-lc-text-muted">Average Score</p>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-lc-border pt-4">
              <p className="text-sm text-gray-500 dark:text-lc-text-muted">
                Last Active: {selectedStudent.lastActive}
              </p>
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
                  navigate(`/admin/students/edit/${selectedStudent.id}`, {
                    state: {
                      student: {
                        fullName: selectedStudent.name,
                        universityEmail: selectedStudent.email,
                        studentId: selectedStudent.rollNumber,
                        department: selectedStudent.department,
                        year: String(selectedStudent.year),
                        section: selectedStudent.section,
                        enrollmentYear: selectedStudent.enrollmentDate.slice(0, 4),
                        placementEligible: selectedStudent.status === 'active',
                        cgpa: (selectedStudent.averageScore / 10).toFixed(2),
                      },
                    },
                  });
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

      {showImportConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold dark:text-lc-text mb-2">Confirm CSV Import</h3>
            <p className="text-sm text-gray-600 dark:text-lc-text-muted mb-4">
              This will import valid rows and skip invalid rows with detailed error reporting.
            </p>
            <div className="space-y-2 text-sm mb-6">
              <p className="dark:text-lc-text">
                Total Rows: <span className="font-semibold">{csvRows.length}</span>
              </p>
              <p className="text-green-600 dark:text-green-400">
                Valid Rows:{' '}
                <span className="font-semibold">
                  {csvRows.filter((row) => row.errors.length === 0).length}
                </span>
              </p>
              <p className="text-red-600 dark:text-red-400">
                Rows to Skip:{' '}
                <span className="font-semibold">
                  {csvRows.filter((row) => row.errors.length > 0).length}
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImportConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Import Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-add-title"
        >
          <div className="bg-white dark:bg-lc-card rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 id="manual-add-title" className="text-xl font-bold dark:text-lc-text mb-1">
              Add Student Manually (Fallback)
            </h3>
            <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-5">
              Use this only for late admissions, missing students, or record corrections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  value={manualForm.rollNumber}
                  onChange={(event) =>
                    setManualForm((prev) => ({
                      ...prev,
                      rollNumber: event.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={manualForm.email}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Department *
                </label>
                <select
                  value={manualForm.department}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                >
                  {allowedDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Year *
                </label>
                <select
                  value={manualForm.year}
                  onChange={(event) =>
                    setManualForm((prev) => ({ ...prev, year: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                  Section *
                </label>
                <input
                  type="text"
                  value={manualForm.section}
                  onChange={(event) =>
                    setManualForm((prev) => ({
                      ...prev,
                      section: event.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/admin/students/new')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open full detailed form instead
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowManualAddModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-lc-border-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualAddStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default StudentManagementPage;
