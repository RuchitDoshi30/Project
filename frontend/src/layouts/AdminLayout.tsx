import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Code2,
  LogOut,
  User,
  LayoutDashboard,
  Users,
  FileCode,
  BookOpen,
  Menu,
  X,
  ClipboardList,
  Megaphone,
  Mail,
  BarChart3,
} from 'lucide-react';

/**
 * AdminLayout — Sidebar + header layout for admin pages
 * Uses the LeetCode dark palette via lc.* tokens
 */
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Students', href: '/admin/students', icon: Users },
    { name: 'Coding Problems', href: '/admin/problems', icon: FileCode },
    { name: 'Aptitude Tests', href: '/admin/aptitude', icon: BookOpen },
    { name: 'divider', href: '', icon: null },
    { name: 'Placement Drives', href: '/admin/drives', icon: ClipboardList },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Send Email', href: '/admin/email', icon: Mail },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-lc-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 xl:w-72 bg-white dark:bg-lc-card border-r border-gray-200 dark:border-lc-border h-screen sticky top-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-lc-border flex-shrink-0">
            <Code2 className="h-8 w-8 text-primary-600 dark:text-accent-500" aria-hidden="true" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-lc-text">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.name === 'divider') {
                return (
                  <div key="divider" className="my-2 px-4">
                    <div className="border-t border-gray-200 dark:border-lc-border"></div>
                  </div>
                );
              }

              const Icon = item.icon!;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                    ? 'bg-primary-50 dark:bg-accent-500/10 text-primary-700 dark:text-accent-400'
                    : 'text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated'
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-lc-border p-4 flex-shrink-0 bg-white dark:bg-lc-card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary-600 dark:text-accent-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-lc-text truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Administrator</p>
              </div>
            </div>
            <div className="mb-3">
              <ThemeToggle className="w-full justify-center dark:bg-lc-elevated dark:hover:bg-lc-border" showLabel={true} />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
        >
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs sm:max-w-sm bg-white dark:bg-lc-card shadow-xl">
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-lc-border">
              <div className="flex items-center">
                <Code2 className="h-8 w-8 text-primary-600 dark:text-accent-500" aria-hidden="true" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-lc-text">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                if (item.name === 'divider') {
                  return (
                    <div key="divider-mobile" className="my-2 px-4">
                      <div className="border-t border-gray-200 dark:border-lc-border"></div>
                    </div>
                  );
                }

                const Icon = item.icon!;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                      ? 'bg-primary-50 dark:bg-accent-500/10 text-primary-700 dark:text-accent-400'
                      : 'text-gray-700 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated'
                      }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile user section */}
            <div className="border-t border-gray-200 dark:border-lc-border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600 dark:text-accent-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-lc-text">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-lc-text-muted">Administrator</p>
                </div>
              </div>
              <div className="mb-3">
                <ThemeToggle className="w-full justify-center dark:bg-lc-elevated dark:hover:bg-lc-border" showLabel={true} />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 bg-white dark:bg-lc-card border-b border-gray-200 dark:border-lc-border px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-lc-text-secondary hover:bg-gray-100 dark:hover:bg-lc-elevated"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-2 lg:ml-0 text-lg sm:text-xl font-bold text-gray-900 dark:text-lc-text truncate">
              {navigation.find((item) => isActive(item.href))?.name || 'Admin Panel'}
            </h1>
          </div>

          {/* Desktop user info in header */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-accent-500/15 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600 dark:text-accent-400" aria-hidden="true" />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-gray-900 dark:text-lc-text">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-lc-text-muted">Administrator</p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto w-full h-full">{children}</main>
      </div>
    </div>
  );
};
