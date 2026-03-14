import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, PageHeader, Card } from '../components';
import {
  Building2, Calendar, Users, IndianRupee, Plus, Edit2, Trash2,
  Search, Filter, Eye, MapPin, Briefcase, GraduationCap,
  CheckCircle, Clock, XCircle, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPlacementDrives,
  deletePlacementDriveById,
  type PlacementDrive,
} from '../services/admin-content.service';

const PlacementDrivesPage = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<PlacementDrive[]>(() => getPlacementDrives());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedDrive, setExpandedDrive] = useState<string | null>(null);

  const filteredDrives = useMemo(() => drives.filter((drive) => {
    const matchesSearch = drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [drives, searchQuery, statusFilter]);

  const stats = {
    total: drives.length,
    upcoming: drives.filter(d => d.status === 'Upcoming').length,
    ongoing: drives.filter(d => d.status === 'Ongoing').length,
    completed: drives.filter(d => d.status === 'Completed').length,
    totalRegistered: drives.reduce((sum, d) => sum + d.registeredStudents, 0),
    totalSelected: drives.reduce((sum, d) => sum + d.selectedStudents, 0),
  };

  const refreshDrives = () => {
    setDrives(getPlacementDrives());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-lc-border';
      case 'Ongoing':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-lc-border';
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-lc-border';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-lc-border';
      default:
        return 'bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Upcoming': return <Clock className="w-3.5 h-3.5" />;
      case 'Ongoing': return <Clock className="w-3.5 h-3.5" />;
      case 'Completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Cancelled': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const handleDeleteDrive = (id: string) => {
    deletePlacementDriveById(id);
    refreshDrives();
    toast.success('Placement drive deleted');
  };

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="📋 Placement Drives"
        description="Manage campus placement drives, track company visits, and monitor student registrations"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Total Drives</p>
            <p className="text-xl font-bold text-gray-900 dark:text-lc-text">{stats.total}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Upcoming</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.upcoming}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Ongoing</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.ongoing}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Completed</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Registered</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalRegistered}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Selected</p>
            <p className="text-xl font-bold text-accent-600 dark:text-accent-400">{stats.totalSelected}</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/admin/drives/new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-accent-500/15 text-white dark:text-accent-400 dark:border dark:border-accent-500/30 rounded-lg hover:bg-primary-700 dark:hover:bg-accent-500/25 transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Drive
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No drives found</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Try adjusting your filters or create a new drive</p>
          </Card>
        ) : (
          filteredDrives.map((drive) => (
            <Card key={drive.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-lc-elevated rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-gray-600 dark:text-lc-text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-lc-text">{drive.companyName}</h3>
                        <p className="text-sm text-gray-600 dark:text-lc-text-muted flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {drive.jobRole}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusStyle(drive.status)}`}>
                      {getStatusIcon(drive.status)}
                      {drive.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted">
                    <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span><strong className="text-gray-900 dark:text-lc-text">₹{drive.packageLPA} LPA</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>{formatDate(drive.driveDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted">
                    <GraduationCap className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <span>Min CGPA: {drive.minCGPA}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {drive.eligibleBranches.map(branch => (
                    <span key={branch} className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-full border border-gray-200 dark:border-lc-border">
                      {branch}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-gray-500 dark:text-lc-text-muted">
                    <Users className="w-3.5 h-3.5 inline mr-1" />
                    {drive.registeredStudents} registered
                    {drive.selectedStudents > 0 && (
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        · {drive.selectedStudents} selected
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-lc-border">
                  <button
                    onClick={() => setExpandedDrive(expandedDrive === drive.id ? null : drive.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedDrive === drive.id ? 'Hide' : 'Details'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedDrive === drive.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/drives/edit/${drive.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDrive(drive.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                {expandedDrive === drive.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-lc-border space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-2">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-lc-text-muted">{drive.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-2">Selection Rounds</h4>
                      <div className="flex flex-wrap gap-2">
                        {drive.rounds.map((round, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary rounded-lg border border-gray-200 dark:border-lc-border">
                            <span className="w-5 h-5 bg-gray-200 dark:bg-lc-border rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                            {round}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-lc-border">
                        <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Last Date to Apply</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatDate(drive.lastDateToApply)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-lc-border">
                        <p className="text-xs text-gray-600 dark:text-lc-text-muted mb-1">Selection Rate</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          {drive.registeredStudents > 0
                            ? `${Math.round((drive.selectedStudents / drive.registeredStudents) * 100)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default PlacementDrivesPage;
