import { useState } from 'react';
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
  Target
} from 'lucide-react';

/**
 * Profile & Settings Page
 * 
 * User profile management with:
 * - Personal information
 * - Statistics overview
 * - Account settings
 * - Password change
 * - Notification preferences
 * - Privacy settings
 */

interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  batch: string;
  enrollmentDate: string;
  avatar?: string;
  bio: string;
  stats: {
    problemsSolved: number;
    testsCompleted: number;
    currentStreak: number;
    badges: number;
  };
}

// Mock data
const mockProfile: UserProfile = {
  id: '2',
  name: 'Ruchit Patel',
  email: 'ruchit.patel@student.edu',
  studentId: 'ST2024042',
  department: 'Computer Science',
  batch: '2024',
  enrollmentDate: '2024-01-15',
  bio: 'Passionate about algorithms and problem-solving. Love to learn new technologies.',
  stats: {
    problemsSolved: 42,
    testsCompleted: 12,
    currentStreak: 7,
    badges: 8,
  },
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [notifications, setNotifications] = useState({
    emailOnSubmission: true,
    emailOnTestComplete: true,
    emailWeeklySummary: true,
    inAppNotifications: true,
  });

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.new.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    // API call here
    alert('Password changed successfully!');
    setPasswordData({ current: '', new: '', confirm: '' });
    setIsEditingPassword(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container>
      <PageHeader
        title="Profile & Settings"
        description="Manage your account information and preferences"
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.problemsSolved}</p>
              <p className="text-xs text-gray-400">Coding challenges</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Tests Completed</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.testsCompleted}</p>
              <p className="text-xs text-gray-400">Aptitude tests</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Day Streak</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.currentStreak}</p>
              <p className="text-xs text-gray-400">Consecutive days</p>
            </div>
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{profile.stats.badges}</p>
              <p className="text-xs text-gray-400">Achievements</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-5 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-lg p-2">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                {isEditingProfile && (
                  <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                    Change Avatar
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Student ID</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">{profile.studentId}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.department}
                      onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">{profile.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Batch</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.batch}
                      onChange={(e) => setEditedProfile({ ...editedProfile, batch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">{profile.batch}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Enrollment Date</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(profile.enrollmentDate)}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                {isEditingProfile ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200">{profile.bio}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-5 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-lg p-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Update Password
                </button>
              )}
            </div>

            {isEditingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasswordChange}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setPasswordData({ current: '', new: '', confirm: '' });
                      setIsEditingPassword(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="p-5 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 rounded-lg p-2">
                <Bell className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                  <span className="text-sm font-medium text-gray-700">
                    {key === 'emailOnSubmission' && 'Email on Submission'}
                    {key === 'emailOnTestComplete' && 'Email on Test Complete'}
                    {key === 'emailWeeklySummary' && 'Weekly Summary Email'}
                    {key === 'inAppNotifications' && 'In-App Notifications'}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              ))}
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-5 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 rounded-lg p-2">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Privacy</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                <span className="text-sm font-medium text-gray-700">Profile Visible</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                <span className="text-sm font-medium text-gray-700">Show in Leaderboard</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-500"
                />
              </label>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-5 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 rounded-lg p-2">
                <Award className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all border border-gray-200">
                Download My Data
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all border border-gray-200">
                Delete Account
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ProfilePage;
