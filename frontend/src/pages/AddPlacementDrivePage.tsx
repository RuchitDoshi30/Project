import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import {
  getPlacementDriveById,
  savePlacementDrive,
  type PlacementDrive,
} from '../services/admin-content.service';

const AddPlacementDrivePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [packageLPA, setPackageLPA] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [lastDateToApply, setLastDateToApply] = useState('');
  const [location, setLocation] = useState('');
  const [eligibleBranchesInput, setEligibleBranchesInput] = useState('');
  const [minCGPA, setMinCGPA] = useState('6.0');
  const [status, setStatus] = useState<PlacementDrive['status']>('Upcoming');
  const [roundsInput, setRoundsInput] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchDrive = async () => {
      const drive = await getPlacementDriveById(id);
      if (!drive) {
        toast.error('Placement drive not found');
        navigate('/admin/drives');
        return;
      }

      setCompanyName(drive.companyName);
      setJobRole(drive.jobRole);
      setPackageLPA(drive.packageLPA);
      setDriveDate(drive.driveDate);
      setLastDateToApply(drive.lastDateToApply);
      setLocation(drive.location);
      setEligibleBranchesInput(drive.eligibleBranches.join(', '));
      setMinCGPA(String(drive.minCGPA));
      setStatus(drive.status);
      setRoundsInput(drive.rounds.join('\n'));
      setDescription(drive.description);
    };

    fetchDrive();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async () => {
    if (
      !companyName.trim() ||
      !jobRole.trim() ||
      !packageLPA.trim() ||
      !driveDate ||
      !lastDateToApply ||
      !location.trim() ||
      !eligibleBranchesInput.trim() ||
      !description.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const minCgpaNumber = Number(minCGPA);
    if (Number.isNaN(minCgpaNumber) || minCgpaNumber < 0 || minCgpaNumber > 10) {
      toast.error('Minimum CGPA must be between 0 and 10');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`${isEditMode ? 'Updating' : 'Creating'} placement drive...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existing = isEditMode && id ? await getPlacementDriveById(id) : undefined;
      const payload: PlacementDrive = {
        id: existing?.id || Date.now().toString(),
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        packageLPA: packageLPA.trim(),
        driveDate,
        lastDateToApply,
        location: location.trim(),
        eligibleBranches: eligibleBranchesInput
          .split(',')
          .map((branch) => branch.trim())
          .filter(Boolean),
        minCGPA: minCgpaNumber,
        status,
        rounds: roundsInput
          .split('\n')
          .map((round) => round.trim())
          .filter(Boolean),
        registeredStudents: existing?.registeredStudents || 0,
        selectedStudents: existing?.selectedStudents || 0,
        description: description.trim(),
        companyLogo: existing?.companyLogo,
      };

      savePlacementDrive(payload);

      toast.success(`Placement drive ${isEditMode ? 'updated' : 'created'} successfully!`, {
        id: toastId,
      });
      navigate('/admin/drives');
    } catch {
      toast.error('Failed to save drive. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-lc-bg py-6">
      <Container>
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/drives')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted hover:text-gray-900 dark:hover:text-lc-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Placement Drives
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
              {isEditMode ? 'Edit Placement Drive' : 'Create New Placement Drive'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-lc-text-muted">
              {isEditMode
                ? 'Update drive details and eligibility criteria'
                : 'Create a new placement drive announcement'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="border-b border-gray-200 dark:border-lc-border pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-lc-text">
                  Drive Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted mt-1">
                  Provide complete company and drive information
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Job Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Package (LPA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={packageLPA}
                      onChange={(e) => setPackageLPA(e.target.value)}
                      placeholder="e.g., 7.5"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Drive Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Last Date to Apply <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={lastDateToApply}
                      onChange={(e) => setLastDateToApply(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Eligible Branches <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eligibleBranchesInput}
                      onChange={(e) => setEligibleBranchesInput(e.target.value)}
                      placeholder="e.g., CS, IT, EC"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                      Minimum CGPA <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={minCGPA}
                      onChange={(e) => setMinCGPA(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Selection Rounds <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={roundsInput}
                    onChange={(e) => setRoundsInput(e.target.value)}
                    placeholder="One round per line&#10;e.g., Online Test&#10;Technical Interview"
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-4 uppercase tracking-wide">
                Publish Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                    Drive Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlacementDrive['status'])}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-lc-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-lc-card dark:text-lc-text"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
                        {isEditMode ? 'Updating...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? 'Update' : 'Publish'} Drive
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/admin/drives')}
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

export default AddPlacementDrivePage;
