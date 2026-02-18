import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Components
import { ProtectedRoute } from '../components/ProtectedRoute';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CodingPage from '../pages/CodingPage';
import ProblemSolvePage from '../pages/ProblemSolvePage';
import AptitudePage from '../pages/AptitudePage';
import TestTakePage from '../pages/TestTakePage';
import AptitudeTestResultsPage from '../pages/AptitudeTestResultsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import StudentManagementPage from '../pages/StudentManagementPage';
import SubmissionReviewPage from '../pages/SubmissionReviewPage';
import ProblemManagementPage from '../pages/ProblemManagementPage';
import AptitudeManagementPage from '../pages/AptitudeManagementPage';
import AddProblemPage from '../pages/AddProblemPage';
import AddAptitudeQuestionPage from '../pages/AddAptitudeQuestionPage';
import ProgressAnalyticsPage from '../pages/ProgressAnalyticsPage';
import SubmissionHistoryPage from '../pages/SubmissionHistoryPage';
import TestResultsHistoryPage from '../pages/TestResultsHistoryPage';
import ProfilePage from '../pages/ProfilePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import RecommendedProblemsPage from '../pages/RecommendedProblemsPage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import PlacementDrivesPage from '../pages/PlacementDrivesPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import BulkEmailPage from '../pages/BulkEmailPage';
import ReportsPage from '../pages/ReportsPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Root Route - Redirect based on role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <StudentLayout>
                  <DashboardPage />
                </StudentLayout>
              )}
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <DashboardPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CodingPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProblemSolvePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <AptitudePage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude/test/:testId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestTakePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude/results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AptitudeTestResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <ProgressAnalyticsPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <SubmissionHistoryPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-results"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <TestResultsHistoryPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <ProfilePage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <LeaderboardPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommended"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <RecommendedProblemsPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <StudentManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <SubmissionReviewPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <ProblemManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AptitudeManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AddProblemPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AddProblemPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AddAptitudeQuestionPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AddAptitudeQuestionPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* New Admin Pages */}
        <Route
          path="/admin/drives"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <PlacementDrivesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AnnouncementsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/email"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <BulkEmailPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
