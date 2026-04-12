import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Container, PageHeader, Card } from '../components';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Bell,
  Shield,
  Edit2,
  Save,
  X,
  Award,
  Code2,
  Brain,
  Trophy,
  Target,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import { fetchUserProgress } from '../services/dashboard.service';
import { authService } from '../services/auth.service';
import { usePageTitle } from '../hooks/usePageTitle';
import type { IUser } from '../types/models';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  branch: string;
  enrollmentYear: string;
  enrollmentDate: string;
  bio: string;
  stats: {
    problemsSolved: number;
    testsCompleted: number;
    currentStreak: number;
    badges: number;
  };
}

const ProfilePage = () => {
  usePageTitle('Profile & Settings');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    emailOnSubmission: true,
    emailOnTestComplete: true,
    emailWeeklySummary: true,
    inAppNotifications: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showInLeaderboard: true,
  });
  const [downloadingData, setDownloadingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const buildProfileFromUser = (user: IUser, stats: UserProfile['stats']): UserProfile => ({
    id: user._id || '',
    name: user.name || 'Student',
    email: user.email || '',
    studentId: user.universityId || '',
    branch: user.branch || 'N/A',
    enrollmentYear: user.enrollmentYear ? String(user.enrollmentYear) : 'N/A',
    enrollmentDate: user.createdAt || new Date().toISOString(),
    bio: user.bio || '',
    stats,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
        const progress = await fetchUserProgress();
        const totalSolved =
          (progress.problemsSolved?.easy || 0) +
          (progress.problemsSolved?.medium || 0) +
          (progress.problemsSolved?.hard || 0);
        const stats = {
          problemsSolved: totalSolved,
          testsCompleted: progress.aptitudeTestsTaken || 0,
          currentStreak: 0,
          badges: 0,
        };
        const p = buildProfileFromUser(user, stats);
        setProfile(p);
        setEditedProfile(p);

        // Load notification & privacy prefs from the user object
        if (user.notifications) {
          setNotifications({
            emailOnSubmission: user.notifications.emailOnSubmission ?? true,
            emailOnTestComplete: user.notifications.emailOnTestComplete ?? true,
            emailWeeklySummary: user.notifications.emailWeeklySummary ?? true,
            inAppNotifications: user.notifications.inAppNotifications ?? true,
          });
        }
        if (user.privacy) {
          setPrivacy({
            profileVisible: user.privacy.profileVisible ?? true,
            showInLeaderboard: user.privacy.showInLeaderboard ?? true,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load profile', e);
        const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
        const stats = { problemsSolved: 0, testsCompleted: 0, currentStreak: 0, badges: 0 };
        const p = buildProfileFromUser(user, stats);
        setProfile(p);
        setEditedProfile(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** Save profile changes to the backend */
  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: editedProfile.name,
        bio: editedProfile.bio,
      });
      // Rebuild profile from the server response
      const p = buildProfileFromUser(updatedUser, profile!.stats);
      setProfile(p);
      setEditedProfile(p);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  /** Change password via the backend (verifies current password server-side) */
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    if (!passwordData.current) {
      toast.error('Current password is required!');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword(passwordData.current, passwordData.new);
      toast.success('Password changed successfully!');
      authService.logout();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (err as any)?.response?.status;
      // The global interceptor already handles 400 errors with a toast
      if (status !== 400) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = (err as any)?.response?.data?.message || 'Failed to change password.';
        toast.error(message);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  /** Toggle a notification setting and persist to the backend */
  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await authService.updateProfile({ notifications: updated });
    } catch {
      // Revert on failure
      setNotifications(notifications);
      toast.error('Failed to save notification preferences.');
    }
  };

  /** Toggle a privacy setting and persist to the backend */
  const handlePrivacyToggle = async (key: keyof typeof privacy) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    try {
      await authService.updateProfile({ privacy: updated });
    } catch {
      // Revert on failure
      setPrivacy(privacy);
      toast.error('Failed to save privacy preferences.');
    }
  };

  /** Download all user data as JSON */
  const handleDownloadData = async () => {
    setDownloadingData(true);
    try {
      await authService.downloadMyData();
      toast.success('Your data has been downloaded!');
    } catch {
      toast.error('Failed to download data. Please try again.');
    } finally {
      setDownloadingData(false);
    }
  };

  /** Soft-delete account after confirmation */
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will deactivate your account and you will be logged out. Contact an admin to reactivate.',
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await authService.deleteAccount();
      toast.success('Account deactivated. Redirecting...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch {
      toast.error('Failed to delete account. Please try again.');
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading || !profile || !editedProfile) {
    return (
      <Container size="xl" fullHeight>
        <PageHeader
          title="Profile & Settings"
          description="Manage your account information and preferences"
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-lc-elevated rounded"></div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="Profile & Settings"
        description="Manage your account information and preferences"
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
                {profile.stats.problemsSolved}
              </p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Coding challenges</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Tests Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
                {profile.stats.testsCompleted}
              </p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Aptitude tests</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/40 p-2.5 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Day Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
                {profile.stats.currentStreak}
              </p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Consecutive days</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/40 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
                {profile.stats.badges}
              </p>
              <p className="text-xs text-gray-400 dark:text-lc-text-muted">Achievements</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/40 p-2.5 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">
                  Personal Information
                </h3>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 dark:bg-lc-card dark:text-lc-text hover:bg-gray-800 dark:hover:bg-lc-elevated rounded-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{' '}
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light">
                      {profile.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Student ID
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light">
                    {profile.studentId}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Email
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Branch
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light">
                    {profile.branch}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Enrollment Year
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light">
                    {profile.enrollmentYear}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Enrolled On
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(profile.enrollmentDate)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                  Bio
                </label>
                {isEditingProfile ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text bg-white dark:bg-lc-card px-3 py-2 rounded-lg border border-gray-200 dark:border-lc-border-light min-h-[60px]">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2">
                  <Lock className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">
                  Change Password
                </h3>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg"
                >
                  Update Password
                </button>
              )}
            </div>
            {isEditingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={savingPassword}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{' '}
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setPasswordData({ current: '', new: '', confirm: '' });
                      setIsEditingPassword(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2">
                <Bell className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">
                Notifications
              </h3>
            </div>
            <div className="space-y-3">
              {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer bg-white dark:bg-lc-card p-3 rounded-lg border border-gray-200 dark:border-lc-border-light hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary">
                    {key === 'emailOnSubmission' && 'Email on Submission'}
                    {key === 'emailOnTestComplete' && 'Email on Test Complete'}
                    {key === 'emailWeeklySummary' && 'Weekly Summary Email'}
                    {key === 'inAppNotifications' && 'In-App Notifications'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => handleNotificationToggle(key)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </label>
              ))}
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2">
                <Shield className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Privacy</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer bg-white dark:bg-lc-card p-3 rounded-lg border border-gray-200 dark:border-lc-border-light">
                <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary">
                  Profile Visible
                </span>
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={() => handlePrivacyToggle('profileVisible')}
                  className="w-4 h-4 text-gray-900 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer bg-white dark:bg-lc-card p-3 rounded-lg border border-gray-200 dark:border-lc-border-light">
                <span className="text-sm font-medium text-gray-700 dark:text-lc-text-secondary">
                  Show in Leaderboard
                </span>
                <input
                  type="checkbox"
                  checked={privacy.showInLeaderboard}
                  onChange={() => handlePrivacyToggle('showInLeaderboard')}
                  className="w-4 h-4 text-gray-900 rounded"
                />
              </label>
            </div>
          </Card>

          {/* Account */}
          <Card className="p-5 bg-gray-50 dark:bg-lc-card/50 border-gray-200 dark:border-lc-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 dark:bg-lc-elevated rounded-lg p-2">
                <Award className="w-4 h-4 text-gray-600 dark:text-lc-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text">Account</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleDownloadData}
                disabled={downloadingData}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg border border-gray-200 dark:border-lc-border-light flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadingData ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloadingData ? 'Downloading...' : 'Download My Data'}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deletingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deletingAccount ? 'Deactivating...' : 'Delete Account'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ProfilePage;
