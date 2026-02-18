import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Code2,
  LogOut,
  User,
  BarChart3,
  BookOpen,
  Menu,
  X,
  TrendingUp,
  FileText,
  Award,
  UserCircle,
  Trophy,
  Lightbulb,
} from 'lucide-react';

/**
 * StudentLayout — LeetCode-inspired sidebar + header layout
 *
 * Desktop (lg+): Fixed left sidebar with navigation + compact top header
 * Mobile/Tablet: Collapsible drawer sidebar with hamburger toggle
 */
export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Primary navigation links (always visible in sidebar)
  const primaryNavLinks = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/coding', label: 'Coding', icon: Code2 },
    { path: '/aptitude', label: 'Aptitude', icon: BookOpen },
    { path: '/recommended', label: 'Recommended', icon: Lightbulb },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  // Secondary navigation links (below divider)
  const secondaryNavLinks = [
    { path: '/progress', label: 'Analytics', icon: TrendingUp },
    { path: '/submissions', label: 'Submissions', icon: FileText },
    { path: '/test-results', label: 'Test Results', icon: Award },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  const isActive = (path: string) => location.pathname === path;

  // Current page title for the header
  const currentPageTitle =
    allNavLinks.find((link) => isActive(link.path))?.label || 'PlacementPrep';

  // Render a nav link
  const renderNavLink = (
    link: { path: string; label: string; icon: React.ElementType },
    closeSidebar?: () => void
  ) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={closeSidebar}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${isActive(link.path)
            ? 'bg-primary-50 dark:bg-accent-500/10 text-primary-700 dark:text-accent-400 border-r-2 border-primary-600 dark:border-accent-500'
            : 'text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated hover:text-gray-900 dark:hover:text-lc-text'
          }`}
      >
        <Icon className="mr-3 h-[18px] w-[18px] flex-shrink-0" />
        <span className="truncate">{link.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-lc-bg">
      {/* ===== Desktop Sidebar ===== */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-60 bg-white dark:bg-lc-card border-r border-gray-200 dark:border-lc-border h-screen sticky top-0">
          {/* Logo */}
          <div className="flex items-center h-14 px-5 border-b border-gray-200 dark:border-lc-border flex-shrink-0">
            <Code2 className="h-7 w-7 text-primary-600 dark:text-accent-500" />
            <span className="ml-2.5 text-lg font-bold text-gray-900 dark:text-lc-text">
              PlacementPrep
            </span>
          </div>

          {/* Primary Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {primaryNavLinks.map((link) => renderNavLink(link))}

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="border-t border-gray-200 dark:border-lc-border" />
              <p className="mt-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-lc-text-muted">
                Insights
              </p>
            </div>

            {secondaryNavLinks.map((link) => renderNavLink(link))}
          </nav>

          {/* User section — bottom of sidebar */}
          <div className="border-t border-gray-200 dark:border-lc-border p-3 flex-shrink-0 space-y-2">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary-600 dark:text-accent-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-lc-text truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-lc-text-muted">
                  {user?.universityId}
                </p>
              </div>
            </div>

            {/* Theme toggle */}
            <ThemeToggle
              className="w-full justify-center dark:bg-lc-elevated dark:hover:bg-lc-border"
              showLabel={true}
            />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile Sidebar Drawer ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white dark:bg-lc-card shadow-xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-lc-border">
              <div className="flex items-center">
                <Code2 className="h-7 w-7 text-primary-600 dark:text-accent-500" />
                <span className="ml-2 text-lg font-bold text-gray-900 dark:text-lc-text">
                  PlacementPrep
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {primaryNavLinks.map((link) =>
                renderNavLink(link, () => setSidebarOpen(false))
              )}

              <div className="pt-4 pb-2">
                <div className="border-t border-gray-200 dark:border-lc-border" />
                <p className="mt-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-lc-text-muted">
                  Insights
                </p>
              </div>

              {secondaryNavLinks.map((link) =>
                renderNavLink(link, () => setSidebarOpen(false))
              )}
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-gray-200 dark:border-lc-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600 dark:text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-lc-text-muted">
                    {user?.universityId}
                  </p>
                </div>
              </div>
              <ThemeToggle
                className="w-full justify-center dark:bg-lc-elevated dark:hover:bg-lc-border"
                showLabel={true}
              />
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Main content area ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <div className="flex items-center justify-between h-14 bg-white dark:bg-lc-card border-b border-gray-200 dark:border-lc-border px-4 sm:px-6 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile logo (visible only on small screens) */}
            <Link to="/" className="flex items-center lg:hidden">
              <Code2 className="h-6 w-6 text-primary-600 dark:text-accent-500" />
              <span className="ml-2 text-base font-bold text-gray-900 dark:text-lc-text hidden xs:block">
                PlacementPrep
              </span>
            </Link>

            {/* Page title (desktop) */}
            <h1 className="hidden lg:block text-lg font-semibold text-gray-900 dark:text-lc-text">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right side — theme toggle + user avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle (mobile only — desktop has it in sidebar) */}
            <div className="lg:hidden">
              <ThemeToggle />
            </div>

            {/* User avatar + name */}
            <Link
              to="/profile"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600 dark:text-accent-400" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-lc-text-secondary max-w-[120px] truncate">
                {user?.name}
              </span>
            </Link>

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto w-full">{children}</main>

        {/* Footer */}
        <footer className="bg-white dark:bg-lc-card border-t border-gray-200 dark:border-lc-border py-3 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-500 dark:text-lc-text-muted">
              © 2026 PlacementPrep. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
