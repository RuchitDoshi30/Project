import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

// Layouts
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Components
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Spinner } from '../components/Spinner';

// Lazy-loaded pages for route-level code splitting
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CodingPage = lazy(() => import('../pages/CodingPage'));
const ProblemSolvePage = lazy(() => import('../pages/ProblemSolvePage'));
const AptitudePage = lazy(() => import('../pages/AptitudePage'));
const TestTakePage = lazy(() => import('../pages/TestTakePage'));
const AptitudeTestResultsPage = lazy(() => import('../pages/AptitudeTestResultsPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const StudentManagementPage = lazy(() => import('../pages/StudentManagementPage'));
const SubmissionReviewPage = lazy(() => import('../pages/SubmissionReviewPage'));
const ProblemManagementPage = lazy(() => import('../pages/ProblemManagementPage'));
const AptitudeManagementPage = lazy(() => import('../pages/AptitudeManagementPage'));
const AddProblemPage = lazy(() => import('../pages/AddProblemPage'));
const AddAptitudeQuestionPage = lazy(() => import('../pages/AddAptitudeQuestionPage'));
const ProgressAnalyticsPage = lazy(() => import('../pages/ProgressAnalyticsPage'));
const SubmissionHistoryPage = lazy(() => import('../pages/SubmissionHistoryPage'));
const TestResultsHistoryPage = lazy(() => import('../pages/TestResultsHistoryPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'));
const RecommendedProblemsPage = lazy(() => import('../pages/RecommendedProblemsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const PlacementDrivesPage = lazy(() => import('../pages/PlacementDrivesPage'));
const AnnouncementsPage = lazy(() => import('../pages/AnnouncementsPage'));
const AddPlacementDrivePage = lazy(() => import('../pages/AddPlacementDrivePage'));
const AddAnnouncementPage = lazy(() => import('../pages/AddAnnouncementPage'));
const BulkEmailPage = lazy(() => import('../pages/BulkEmailPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));

const RouteBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <RouteBoundary>
              <LoginPage />
            </RouteBoundary>
          }
        />
        <Route
          path="/forbidden"
          element={
            <RouteBoundary>
              <ForbiddenPage />
            </RouteBoundary>
          }
        />

        {/* Root Route - Redirect based on role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RouteBoundary>
                {user?.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <StudentLayout>
                    <DashboardPage />
                  </StudentLayout>
                )}
              </RouteBoundary>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <DashboardPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <CodingPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <ProblemSolvePage />
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <AptitudePage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude/test/:testId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <TestTakePage />
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude/results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <AptitudeTestResultsPage />
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <ProgressAnalyticsPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <SubmissionHistoryPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-results"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <TestResultsHistoryPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <ProfilePage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <LeaderboardPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommended"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RouteBoundary>
                <StudentLayout>
                  <RecommendedProblemsPage />
                </StudentLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <StudentManagementPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <SubmissionReviewPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <ProblemManagementPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AptitudeManagementPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddProblemPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddProblemPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddAptitudeQuestionPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aptitude/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddAptitudeQuestionPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />

        {/* New Admin Pages */}
        <Route
          path="/admin/drives"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <PlacementDrivesPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drives/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddPlacementDrivePage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drives/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddPlacementDrivePage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AnnouncementsPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddAnnouncementPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <AddAnnouncementPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/email"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <BulkEmailPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RouteBoundary>
                <AdminLayout>
                  <ReportsPage />
                </AdminLayout>
              </RouteBoundary>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <RouteBoundary>
              <NotFoundPage />
            </RouteBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
