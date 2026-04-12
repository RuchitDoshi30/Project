import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Briefcase,
  Play,
  CheckCircle2,
  TrendingUp,
  TerminalSquare,
  Lock,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* 1. Floating Pill Navbar */}
      <nav
        className={`fixed top-6 w-full z-50 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 font-bold">
                P
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:block">
                PlacementPrep
              </span>
            </div>

            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#drives" className="hover:text-white transition-colors">
                Opportunities
              </a>
              <a href="#testify" className="hover:text-white transition-colors">
                Testimonials
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-white text-black hover:scale-105 hover:bg-slate-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Intense Hero Section */}
      <main className="relative pt-40 pb-32 lg:pt-52 lg:pb-40 flex flex-col items-center justify-center min-h-screen">
        {/* Animated Background Mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/30 rounded-full blur-[120px] animate-spin-slow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16">
          {/* Left Text */}
          <div
            className={`flex-1 text-center lg:text-left transition-all duration-1000 delay-100 ease-out transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              The Standard For University Placements
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[1.05]">
              Logic <br className="hidden lg:block" />
              meets <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 animate-gradient-x">
                Opportunity.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Supercharge your career trajectory. Engage with zero-latency coding environments,
              rigorous aptitude simulators, and live placement tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/login"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300"
              >
                <Play className="fill-white w-4 h-4" /> Start Practicing
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Web-based IDE
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Real mock exams
              </span>
            </div>
          </div>

          {/* Right Floating Element (Dribbble 3D feel) */}
          <div
            className={`flex-1 relative w-full h-[400px] lg:h-[500px] transition-all duration-1000 delay-300 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent z-20 pointer-events-none"></div>

            {/* Fake Code Editor Floating Card */}
            <div
              className="absolute top-10 right-0 w-[450px] bg-[#0E0E11] rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-float"
              style={{ animationDelay: '0s' }}
            >
              <div className="px-4 py-3 bg-[#18181B] border-b border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-xs text-slate-400 font-mono">solution.py</div>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed text-slate-300">
                <span className="text-purple-400">def</span>{' '}
                <span className="text-blue-400">twoSum</span>(nums, target):
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;seen = {'{}'}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">for</span> i, num{' '}
                <span className="text-purple-400">in</span>{' '}
                <span className="text-sky-400">enumerate</span>(nums):
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;comp = target - num
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-400">if</span> comp{' '}
                <span className="text-purple-400">in</span> seen:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-400">return</span> [seen[comp], i]
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i<br />
              </div>
            </div>

            {/* Fake Abstract Aptitude Card Front */}
            <div
              className="absolute bottom-10 left-0 w-[300px] bg-white text-black p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Brain className="w-5 h-5" /> Aptitude Test
                </div>
                <span className="text-xs font-bold py-1 px-2 bg-slate-100 rounded-md">24:59</span>
              </div>
              <p className="text-sm font-semibold mb-4 leading-relaxed">
                If 6 men can complete a job in 12 days, how many days will it take for 8 men to do
                the same job?
              </p>
              <div className="space-y-2 text-sm font-medium text-slate-600">
                <div className="w-full py-2 px-3 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-indigo-700 flex justify-between">
                  <span>A) 9 Days</span> <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="w-full py-2 px-3 border border-slate-200 rounded-lg">
                  B) 10 Days
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Infinite Marquee (Companies/Universities) */}
      <section className="border-y border-white/5 py-10 bg-white/5 relative overflow-hidden backdrop-blur-sm flex items-center">
        <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#07070a] to-transparent z-10"></div>
        <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#07070a] to-transparent z-10"></div>

        <div className="animate-marquee items-center gap-16 md:gap-32 pr-16 md:pr-32 opacity-50 font-black text-2xl tracking-tighter uppercase text-slate-400">
          <div>
            <span className="text-indigo-500 uppercase">//</span> Top Universities
          </div>
          <div>
            <span className="text-indigo-500 uppercase">//</span> Industry Leaders
          </div>
          <div>
            <span className="text-indigo-500 uppercase">//</span> Fortune 500
          </div>
          <div>
            <span className="text-indigo-500 uppercase">//</span> Tech Giants
          </div>
          <div>
            <span className="text-indigo-500 uppercase">//</span> Product Startups
          </div>
          <div>
            <span className="text-indigo-500 uppercase">//</span> Cloud Architects
          </div>
        </div>
      </section>

      {/* 4. Bento Grid Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-16 max-w-2xl">
          <h2 className="text-sm font-bold text-indigo-500 tracking-widest uppercase mb-3">
            The Infrastructure
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Everything a modern student needs to secure the bag.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Bento Item 1: Large Coding Block */}
          <div className="md:col-span-2 md:row-span-2 bg-[#111116] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <TerminalSquare className="w-10 h-10 text-indigo-400 mb-6" />
            <h4 className="text-3xl font-bold mb-4">Enterprise Code Editor</h4>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
              Monaco-powered IDE with zero-latency execution. Supports Python, Java, C++, and
              JavaScript. Integrated hidden test cases validate time and space complexities in
              milliseconds.
            </p>
            <div className="w-full h-40 bg-[#07070a] rounded-xl border border-white/5 p-4 font-mono text-sm text-slate-500 relative">
              <div className="flex gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500/50"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/50"></span>
                <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
              </div>
              &gt; Loading Monaco Editor...
              <br />
              &gt; Connecting to execution engine...
              <br />
              &gt; Ready.
              <br />
              <span className="animate-pulse">_</span>
            </div>
          </div>

          {/* Bento Item 2: Aptitude */}
          <div className="md:col-span-1 md:row-span-1 bg-[#111116] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <h4 className="text-xl font-bold mb-2">Aptitude Intelligence</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Quantitative, logical, and verbal reasoning simulators designed to build unbreakable
              focus under pressure.
            </p>
          </div>

          {/* Bento Item 3: Analytics */}
          <div className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all">
            <TrendingUp className="w-8 h-8 text-white mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Micro-Analytics</h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Visualize your progress. Find out exactly which Data Structure or Aptitude topic is
              dragging your percentile down.
            </p>
          </div>

          {/* Bento Item 4: Placement Drives */}
          <div className="md:col-span-2 md:row-span-1 bg-[#111116] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
            <div>
              <Briefcase className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Live Placement Drives</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Get internal announcements and push notifications for university placement drives
                before anyone else. Track your application status seamlessly.
              </p>
            </div>
            <div className="mt-6 flex -space-x-4">
              <img
                className="w-10 h-10 rounded-full border-2 border-[#111116]"
                src="https://ui-avatars.com/api/?name=Amazon&background=fff&color=000"
                alt="Drive"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-[#111116]"
                src="https://ui-avatars.com/api/?name=Google&background=fff&color=000"
                alt="Drive"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-[#111116]"
                src="https://ui-avatars.com/api/?name=Microsoft&background=fff&color=000"
                alt="Drive"
              />
              <div className="w-10 h-10 rounded-full border-2 border-[#111116] bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                +24
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Review / Social Proof */}
      <section className="py-24 bg-white/5 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                Don't guess what companies want.
                <br /> <span className="text-indigo-400">Practice it here.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-md">
                Our environment mimics the exact software and restrictions you will face during
                high-stakes technical interviews.
              </p>
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-black text-white">10k+</div>
                  <div className="text-sm text-slate-500 font-medium">Problems Solved</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">4.9/5</div>
                  <div className="text-sm text-slate-500 font-medium">Student Rating</div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-[#0a0a0e] border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="flex text-amber-400 mb-4 text-xl">★★★★★</div>
                <p className="text-lg font-medium italic text-slate-300 leading-relaxed mb-6">
                  "I was completely bombing my mock interviews until I started grinding the advanced
                  DSA topics and timed aptitude quizzes on this platform. I literally saw the exact
                  same graph question in my actual technical round."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Aarav Gupta</h4>
                    <p className="text-sm text-slate-500">Placed at Tier-1 Product Company</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Massive CTA Footer */}
      <footer className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-t-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 mb-32">
          <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Secure Your Future.
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
            Join the centralized platform that empowers students to track, practice, and conquer
            university placement drives.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full bg-white text-black hover:scale-105 hover:bg-slate-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] gap-2"
          >
            Access Portal <Lock className="w-4 h-4" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">P</span>
            </div>
            <span className="font-bold text-slate-300 tracking-tight">PlacementPrep</span>
          </div>
          <p className="text-sm font-medium text-slate-600">
            &copy; {new Date().getFullYear()} PlacementPrep. All rights reserved..
          </p>
        </div>
      </footer>
    </div>
  );
}
