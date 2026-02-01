import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User, BarChart3, BookOpen, Menu, X, TrendingUp, FileText, Award, UserCircle, ChevronDown, Trophy, Lightbulb } from 'lucide-react';

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Main navigation links
  const mainNavLinks = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/coding', label: 'Coding', icon: Code2 },
    { path: '/aptitude', label: 'Aptitude', icon: BookOpen },
    { path: '/recommended', label: 'Recommended', icon: Lightbulb },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  // Secondary navigation links (in dropdown)
  const secondaryNavLinks = [
    { path: '/progress', label: 'Analytics', icon: TrendingUp },
    { path: '/submissions', label: 'Submissions', icon: FileText },
    { path: '/test-results', label: 'Test Results', icon: Award },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">
                  PlacementPrep
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4 lg:space-x-8">
                {mainNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                        isActive(link.path)
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-600 hover:border-primary-300 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Profile Dropdown - Desktop */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] lg:max-w-none">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.universityId}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {secondaryNavLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActive(link.path)
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile user icon */}
              <div className="md:hidden w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>

              {/* Desktop Logout (hidden - now in dropdown) */}
              <button
                onClick={handleLogout}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {allNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.universityId}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full min-h-0">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 sm:py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © 2026 PlacementPrep. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
