import { useState } from 'react';
import { Container, PageHeader, Card } from '../components';
import {
    BarChart3, TrendingUp, Users, GraduationCap, Award,
    Code2, Brain, Building2, Target, PieChart, ArrowUp,
    ArrowDown, Minus
} from 'lucide-react';

/**
 * Reports & Analytics Page
 *
 * Comprehensive analytics for placement readiness:
 * - Branch-wise performance
 * - Top performers
 * - Placement statistics
 * - Weak areas analysis
 */

const mockReports = {
    placementStats: {
        totalEligible: 340,
        totalPlaced: 85,
        placementRate: 25,
        avgPackage: '5.8',
        highestPackage: '16.0',
        companiesVisited: 6,
    },
    branchPerformance: [
        { branch: 'CS', students: 90, placed: 35, avgCoding: 72, avgAptitude: 78, placementRate: 39 },
        { branch: 'IT', students: 85, placed: 28, avgCoding: 68, avgAptitude: 75, placementRate: 33 },
        { branch: 'EC', students: 60, placed: 12, avgCoding: 55, avgAptitude: 70, placementRate: 20 },
        { branch: 'EE', students: 55, placed: 6, avgCoding: 48, avgAptitude: 65, placementRate: 11 },
        { branch: 'ME', students: 50, placed: 4, avgCoding: 35, avgAptitude: 60, placementRate: 8 },
    ],
    topPerformers: [
        { rank: 1, name: 'Rahul Sharma', branch: 'CS', codingScore: 95, aptitudeScore: 92, overall: 93.5, status: 'Placed', company: 'Amazon' },
        { rank: 2, name: 'Priya Patel', branch: 'CS', codingScore: 92, aptitudeScore: 90, overall: 91.0, status: 'Placed', company: 'Google' },
        { rank: 3, name: 'Amit Kumar', branch: 'IT', codingScore: 88, aptitudeScore: 91, overall: 89.5, status: 'Placed', company: 'TCS Digital' },
        { rank: 4, name: 'Sneha Reddy', branch: 'CS', codingScore: 90, aptitudeScore: 85, overall: 87.5, status: 'Placed', company: 'Amazon' },
        { rank: 5, name: 'Vikram Singh', branch: 'IT', codingScore: 85, aptitudeScore: 88, overall: 86.5, status: 'Unplaced', company: '-' },
        { rank: 6, name: 'Ananya Iyer', branch: 'EC', codingScore: 82, aptitudeScore: 86, overall: 84.0, status: 'Placed', company: 'Infosys' },
        { rank: 7, name: 'Rohan Joshi', branch: 'CS', codingScore: 80, aptitudeScore: 85, overall: 82.5, status: 'Unplaced', company: '-' },
        { rank: 8, name: 'Kavya Nair', branch: 'IT', codingScore: 78, aptitudeScore: 84, overall: 81.0, status: 'Unplaced', company: '-' },
        { rank: 9, name: 'Deepak Verma', branch: 'EE', codingScore: 75, aptitudeScore: 82, overall: 78.5, status: 'Placed', company: 'Wipro' },
        { rank: 10, name: 'Meera Krishnan', branch: 'EC', codingScore: 72, aptitudeScore: 80, overall: 76.0, status: 'Unplaced', company: '-' },
    ],
    weakTopics: [
        { topic: 'Dynamic Programming', avgScore: 35, totalAttempts: 180, category: 'Coding' },
        { topic: 'Graph Algorithms', avgScore: 42, totalAttempts: 150, category: 'Coding' },
        { topic: 'System Design', avgScore: 38, totalAttempts: 90, category: 'Coding' },
        { topic: 'Verbal Reasoning', avgScore: 48, totalAttempts: 220, category: 'Aptitude' },
        { topic: 'Data Interpretation', avgScore: 52, totalAttempts: 200, category: 'Aptitude' },
    ],
    readiness: {
        ready: 85,
        needsWork: 155,
        notStarted: 100,
    },
};

const ReportsPage = () => {
    const [activeSection, setActiveSection] = useState<'overview' | 'branch' | 'performers' | 'weak'>('overview');
    const { placementStats, branchPerformance, topPerformers, weakTopics, readiness } = mockReports;

    const getTrendIcon = (value: number) => {
        if (value >= 30) return <ArrowUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
        if (value >= 15) return <Minus className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />;
        return <ArrowDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
    };

    return (
        <Container size="xl" fullHeight>
            <PageHeader
                title="📊 Reports & Analytics"
                description="Placement readiness, branch performance, and student analytics"
            />

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { key: 'overview', label: 'Overview', icon: BarChart3 },
                    { key: 'branch', label: 'Branch-wise', icon: GraduationCap },
                    { key: 'performers', label: 'Top Performers', icon: Award },
                    { key: 'weak', label: 'Weak Areas', icon: Target },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSection(tab.key as typeof activeSection)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${activeSection === tab.key
                                    ? 'bg-primary-600 dark:bg-accent-500/15 text-white dark:text-accent-400 border-primary-600 dark:border-accent-500/30'
                                    : 'text-gray-600 dark:text-lc-text-secondary border-gray-200 dark:border-lc-border hover:border-gray-300 dark:hover:border-lc-border-light'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <div className="space-y-6">
                    {/* Placement Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-gray-900 dark:text-lc-text">{placementStats.totalEligible}</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Eligible</p>
                            </div>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <Award className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{placementStats.totalPlaced}</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Placed</p>
                            </div>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <TrendingUp className="w-5 h-5 text-accent-600 dark:text-accent-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-accent-600 dark:text-accent-400">{placementStats.placementRate}%</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Rate</p>
                            </div>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-gray-900 dark:text-lc-text">₹{placementStats.avgPackage}L</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Avg Package</p>
                            </div>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{placementStats.highestPackage}L</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Highest</p>
                            </div>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <div className="p-4 text-center">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-xl font-bold text-gray-900 dark:text-lc-text">{placementStats.companiesVisited}</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted">Companies</p>
                            </div>
                        </Card>
                    </div>

                    {/* Placement Readiness Breakdown */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-4 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Placement Readiness
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-lc-border text-center">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{readiness.ready}</p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted">✅ Placement Ready</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted mt-1">Scored ≥70% in both Coding & Aptitude</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-lc-border text-center">
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{readiness.needsWork}</p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted">⚠️ Needs Improvement</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted mt-1">Scored 40-70% — need more practice</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-lc-border text-center">
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{readiness.notStarted}</p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-lc-text-muted">❌ Not Started</p>
                                <p className="text-xs text-gray-500 dark:text-lc-text-muted mt-1">Haven't attempted enough problems/tests</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Branch-wise Section */}
            {activeSection === 'branch' && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-lc-elevated border-b border-gray-200 dark:border-lc-border">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Branch</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Students</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Placed</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Rate</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Avg Coding</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Avg Aptitude</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-lc-border">
                                {branchPerformance.map(branch => (
                                    <tr key={branch.branch} className="hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-lc-text">{branch.branch}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-lc-text-secondary">{branch.students}</td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-green-600 dark:text-green-400">{branch.placed}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-bold ${branch.placementRate >= 30 ? 'text-green-600 dark:text-green-400' :
                                                    branch.placementRate >= 15 ? 'text-orange-600 dark:text-orange-400' :
                                                        'text-red-600 dark:text-red-400'
                                                }`}>
                                                {branch.placementRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 dark:bg-accent-400 rounded-full" style={{ width: `${branch.avgCoding}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-lc-text-secondary">{branch.avgCoding}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-lc-elevated rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-600 dark:bg-purple-400 rounded-full" style={{ width: `${branch.avgAptitude}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-lc-text-secondary">{branch.avgAptitude}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{getTrendIcon(branch.placementRate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Top Performers Section */}
            {activeSection === 'performers' && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-lc-elevated border-b border-gray-200 dark:border-lc-border">
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Rank</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Student</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Branch</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Coding</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Aptitude</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Overall</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-lc-text-muted uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-lc-border">
                                {topPerformers.map(student => (
                                    <tr key={student.rank} className="hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${student.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                                                    student.rank === 2 ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                                        student.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                                                            'bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted'
                                                }`}>
                                                {student.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-lc-text">{student.name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-full">{student.branch}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400">{student.codingScore}%</td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-purple-600 dark:text-purple-400">{student.aptitudeScore}%</td>
                                        <td className="px-4 py-3 text-center text-sm font-bold text-accent-600 dark:text-accent-400">{student.overall}%</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${student.status === 'Placed'
                                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-lc-border'
                                                    : 'bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-muted border-gray-200 dark:border-lc-border'
                                                }`}>
                                                {student.status === 'Placed' ? student.company : 'Unplaced'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Weak Areas Section */}
            {activeSection === 'weak' && (
                <div className="space-y-4">
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
                            Topics Needing Attention
                            <span className="text-xs text-gray-500 dark:text-lc-text-muted font-normal ml-2">
                                (avg score below 55% — consider arranging workshops)
                            </span>
                        </h3>
                        <div className="space-y-4">
                            {weakTopics.map((topic, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-lc-elevated rounded-lg border border-gray-200 dark:border-lc-border">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                        {topic.category === 'Coding' ? (
                                            <Code2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <Brain className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-lc-text">{topic.topic}</p>
                                            <span className="text-xs font-medium text-gray-500 dark:text-lc-text-muted">{topic.totalAttempts} attempts</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-200 dark:bg-lc-border rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${topic.avgScore < 40 ? 'bg-red-500' :
                                                            topic.avgScore < 50 ? 'bg-orange-500' :
                                                                'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${topic.avgScore}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold ${topic.avgScore < 40 ? 'text-red-600 dark:text-red-400' :
                                                    topic.avgScore < 50 ? 'text-orange-600 dark:text-orange-400' :
                                                        'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                {topic.avgScore}%
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${topic.category === 'Coding'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        }`}>
                                        {topic.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </Container>
    );
};

export default ReportsPage;
