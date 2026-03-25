import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Container } from '../components/Container';
import { Card } from '../components/Card';

interface StudentFormState {
  fullName: string;
  universityEmail: string;
  mobileNumber: string;
  studentId: string;
  branch: string;
  semester: string;
  section: string;
  enrollmentYear: string;
  cgpa: string;
  gender: string;
  placementEligible: boolean;
  hosteller: boolean;
  temporaryPassword: string;
  sendWelcomeEmail: boolean;
  notes: string;
}

const fallbackStudentData: Record<string, Partial<StudentFormState>> = {
  '1': {
    fullName: 'Rahul Sharma',
    universityEmail: 'rahul.sharma@student.edu',
    studentId: 'ST2024001',
    enrollmentYear: '2024',
    placementEligible: true,
  },
  '2': {
    fullName: 'Priya Patel',
    universityEmail: 'priya.patel@student.edu',
    studentId: 'ST2024002',
    enrollmentYear: '2024',
    placementEligible: true,
  },
};

const AddStudentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const locationState = location.state as { student?: Partial<StudentFormState> } | null;

  const [fullName, setFullName] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [branch, setBranch] = useState('Computer Engineering');
  const [semester, setSemester] = useState('6');
  const [section, setSection] = useState('A');
  const [enrollmentYear, setEnrollmentYear] = useState('2024');
  const [cgpa, setCgpa] = useState('7.0');
  const [gender, setGender] = useState('Prefer not to say');
  const [placementEligible, setPlacementEligible] = useState(true);
  const [hosteller, setHosteller] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const source = locationState?.student || (id ? fallbackStudentData[id] : undefined);

    if (!source) {
      toast.error('Student details not found. Please update manually.');
      return;
    }

    setFullName(source.fullName ?? '');
    setUniversityEmail(source.universityEmail ?? '');
    setMobileNumber(source.mobileNumber ?? '');
    setStudentId(source.studentId ?? '');
    setBranch(source.branch ?? 'Computer Engineering');
    setSemester(source.semester ?? '6');
    setSection(source.section ?? 'A');
    setEnrollmentYear(source.enrollmentYear ?? '2024');
    setCgpa(source.cgpa ?? '7.0');
    setGender(source.gender ?? 'Prefer not to say');
    setPlacementEligible(source.placementEligible ?? true);
    setHosteller(source.hosteller ?? false);
    setTemporaryPassword(source.temporaryPassword ?? '');
    setSendWelcomeEmail(source.sendWelcomeEmail ?? true);
    setNotes(source.notes ?? '');
  }, [id, isEditMode, locationState?.student]);

  const generateStudentId = () => {
    const year = enrollmentYear || new Date().getFullYear().toString();
    const random = Math.floor(1000 + Math.random() * 9000);
    setStudentId(`ST${year}${random}`);
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
    let pwd = '';
    for (let index = 0; index < 10; index += 1) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(pwd);
  };

  const handleSubmit = async () => {
    if (
      !fullName.trim() ||
      !universityEmail.trim() ||
      !mobileNumber.trim() ||
      !studentId.trim() ||
      !temporaryPassword.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const semesterNumber = Number(semester);
    if (Number.isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
      toast.error('Semester must be between 1 and 8');
      return;
    }

    const cgpaValue = Number(cgpa);
    if (Number.isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
      toast.error('CGPA must be between 0 and 10');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(universityEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`${isEditMode ? 'Updating' : 'Creating'} student account...`);

    try {
      const { api } = await import('../services/api.client');
      const payload = {
        name: fullName.trim(),
        email: universityEmail.trim(),
        universityId: studentId.trim(),
        passwordHash: temporaryPassword,
        branch: branch,
        semester: Number(semester),
        enrollmentYear: Number(enrollmentYear),
        role: 'student' as const,
      };

      if (isEditMode && id) {
        await api.put(`/dashboard/students/${id}`, payload);
      } else {
        await api.post('/dashboard/students', payload);
      }

      toast.success(`Student account ${isEditMode ? 'updated' : 'created'} successfully!`, {
        id: toastId,
      });
      navigate('/admin/students');
    } catch {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} student. Please try again.`, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-lc-bg py-6">
      <Container>
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted hover:text-gray-900 dark:hover:text-lc-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
              {isEditMode ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-lc-text-muted">
              {isEditMode
                ? 'Update student profile, academic information, and account access details'
                : 'Create a complete student profile with academic, contact, and access details'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="border-b border-gray-200 dark:border-lc-border pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-lc-text">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted mt-1">
                  Basic profile and contact information
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="e.g., Priya Sharma"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      University Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={universityEmail}
                      onChange={(event) => setUniversityEmail(event.target.value)}
                      placeholder="student@university.edu"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(event) =>
                        setMobileNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="10-digit number"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option>Prefer not to say</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Hostel Status
                    </label>
                    <select
                      value={hosteller ? 'Hosteller' : 'Day Scholar'}
                      onChange={(event) => setHosteller(event.target.value === 'Hosteller')}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option>Day Scholar</option>
                      <option>Hosteller</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="border-b border-gray-200 dark:border-lc-border pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-lc-text">
                  Academic Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted mt-1">
                  Program and eligibility details for placements and reports
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentId}
                        onChange={(event) => setStudentId(event.target.value.toUpperCase())}
                        placeholder="e.g., ST20241234"
                        className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={generateStudentId}
                        className="px-3.5 py-2.5 text-xs font-medium bg-gray-100 dark:bg-lc-elevated text-gray-800 dark:text-lc-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-lc-border-light transition-colors"
                      >
                        Auto-generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Enrollment Year
                    </label>
                    <input
                      type="number"
                      min="2018"
                      max="2030"
                      value={enrollmentYear}
                      onChange={(event) => setEnrollmentYear(event.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(event) => setBranch(event.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option>Computer Engineering</option>
                      <option>Information Technology</option>
                      <option>Electronics & Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                        Semester
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                        Section
                      </label>
                      <input
                        type="text"
                        value={section}
                        onChange={(event) =>
                          setSection(event.target.value.toUpperCase().slice(0, 1))
                        }
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={cgpa}
                      onChange={(event) => setCgpa(event.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-lc-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={placementEligible}
                        onChange={(event) => setPlacementEligible(event.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      Mark as placement eligible
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="border-b border-gray-200 dark:border-lc-border pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-lc-text">
                  Account Access
                </h2>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted mt-1">
                  Set secure onboarding credentials and communication options
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Temporary Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={temporaryPassword}
                      onChange={(event) => setTemporaryPassword(event.target.value)}
                      placeholder="Set initial login password"
                      className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={generateTemporaryPassword}
                      className="px-3.5 py-2.5 text-xs font-medium bg-gray-100 dark:bg-lc-elevated text-gray-800 dark:text-lc-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-lc-border-light transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-lc-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(event) => setSendWelcomeEmail(event.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    Send welcome email with login details
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional internal notes (special accommodations, mentoring group, etc.)"
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-4 uppercase tracking-wide">
                {isEditMode ? 'Update Account' : 'Create Account'}
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-lc-text-muted">Profile status</span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${fullName && universityEmail && studentId ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
                  >
                    {fullName && universityEmail && studentId ? 'Ready' : 'Incomplete'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-lc-text-muted">Placement status</span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${placementEligible ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-lc-elevated dark:text-lc-text-muted'}`}
                  >
                    {placementEligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>

                <div className="pt-4 border-t dark:border-lc-border space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? 'Update Student' : 'Create Student'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/admin/students')}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddStudentPage;
