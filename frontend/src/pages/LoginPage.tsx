import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Code2, AlertCircle, Loader2, Trophy, Target, TrendingUp } from 'lucide-react';
import type { LoginCredentials } from '../types/auth.types';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname;
      if (user.role === 'admin') {
        navigate(from || '/admin', { replace: true });
      } else {
        navigate(from || '/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data as LoginCredentials);
      toast.success('Welcome back! Login successful.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-16 bg-white dark:bg-lc-bg overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo and Title */}
          <div className="mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-primary-600 dark:bg-accent-500 p-3 rounded-xl">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-lc-text">PlacementPrep</h1>
                <p className="text-sm text-gray-600 dark:text-lc-text-muted">Engineering Excellence</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-lc-text mb-2">Welcome back</h2>
            <p className="text-gray-600 dark:text-lc-text-muted">Sign in to continue your preparation journey</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="student@college.edu"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-lc-border">
            <p className="text-sm text-gray-500 dark:text-lc-text-muted mb-3 font-medium">Demo Credentials:</p>
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-lc-card p-3 rounded-lg border border-gray-200 dark:border-lc-border">
                <p className="text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">Student Account</p>
                <p className="text-xs text-gray-600 dark:text-lc-text-muted">john.doe@college.edu / student123</p>
              </div>
              <div className="bg-gray-50 dark:bg-lc-card p-3 rounded-lg border border-gray-200 dark:border-lc-border">
                <p className="text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-1">Admin Account</p>
                <p className="text-xs text-gray-600 dark:text-lc-text-muted">admin@college.edu / admin123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-lc-text-muted mt-6">
            © 2026 PlacementPrep. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Hero Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 xl:px-16 text-white">
          <div className="max-w-xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Master Your Skills</h2>
              <p className="text-xl text-primary-100 leading-relaxed">
                Prepare for placements with our comprehensive platform featuring coding challenges and aptitude tests
              </p>
            </div>

            {/* Feature Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <Code2 className="h-8 w-8 text-white mx-auto" />
                </div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-primary-100">Problems</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <Target className="h-8 w-8 text-white mx-auto" />
                </div>
                <p className="text-2xl font-bold">100+</p>
                <p className="text-sm text-primary-100">Tests</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <TrendingUp className="h-8 w-8 text-white mx-auto" />
                </div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-primary-100">Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
