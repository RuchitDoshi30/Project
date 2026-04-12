import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, Brain, Trophy, ChevronRight, Briefcase, Zap } from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animations
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Navbar Minimal */}
      <nav className="fixed w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                PlacementPrep
              </span>
            </div>
            <div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all duration-200"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-[20%] right-[-5%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 shadow-sm border border-indigo-200 dark:border-indigo-800">
                <Zap className="w-4 h-4" />
                The Ultimate Placement Engine
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
                Master{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Coding
                </span>{' '}
                & Crush{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Aptitude
                </span>{' '}
                Exams.
              </h1>
              <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                Your universities all-in-one portal for placement preparation. Practice competitive
                coding, take mock exams, and secure your dream job.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Start Preparing
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 dark:border-slate-800 text-lg font-bold rounded-full text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300"
                >
                  Explore Features
                </a>
              </div>
            </div>
          </div>

          {/* Dribbble-style Feature Cards (Staggered Animation) */}
          <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
            <FeatureCard
              delay={300}
              isVisible={isVisible}
              icon={<Code className="h-8 w-8 text-indigo-500" />}
              title="Coding Challenges"
              description="Extensive library of DSA problems to sharpen your logic. Built-in code editor supports multiple languages with instant test case evaluation."
              color="bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50"
            />
            <FeatureCard
              delay={500}
              isVisible={isVisible}
              icon={<Brain className="h-8 w-8 text-purple-500" />}
              title="Aptitude Tests"
              description="Real-world mock exams simulating top tech companies. Track your logical, quantitative, and verbal reasoning progress over time."
              color="bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50"
              featured
            />
            <FeatureCard
              delay={700}
              isVisible={isVisible}
              icon={<Briefcase className="h-8 w-8 text-pink-500" />}
              title="Placement Drives"
              description="Never miss an opportunity. Get live updates on upcoming university placement drives, requirements, and scheduled tests directly on your dashboard."
              color="bg-pink-50 border-pink-100 dark:bg-pink-950/20 dark:border-pink-900/50"
            />
          </div>
        </div>

        {/* Bottom Abstract Element */}
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
      </main>

      {/* Footer Minimal */}
      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-slate-900 dark:text-white">PlacementPrep</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} University Placement Preparation Portal. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  delay: number;
  isVisible: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  featured?: boolean;
}

// Subcomponent for the Dribbble-style feature cards
function FeatureCard({
  delay,
  isVisible,
  icon,
  title,
  description,
  color,
  featured = false,
}: FeatureCardProps) {
  return (
    <div
      className={`relative group p-8 rounded-3xl border ${color} shadow-sm hover:shadow-xl transition-all duration-700 ease-out flex flex-col h-full transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Decorative top hover bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-1/2 transition-all duration-500 rounded-b-full"></div>

      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 bg-white dark:bg-slate-900`}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
        {title}
        {featured && (
          <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md uppercase tracking-wider relative -top-1">
            Hot
          </span>
        )}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">{description}</p>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        Learn more{' '}
        <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
