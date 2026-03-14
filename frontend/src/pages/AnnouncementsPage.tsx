    import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, PageHeader, Card } from '../components';
import {
  Megaphone, Plus, Edit2, Trash2, Pin, Calendar, Users,
  AlertTriangle, Info, Bell, Search, Eye,
  ChevronDown, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAnnouncements,
  deleteAnnouncementById,
  toggleAnnouncementPin,
  type Announcement,
} from '../services/admin-content.service';

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getAnnouncements());
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const filteredAnnouncements = useMemo(() => announcements.filter((ann) => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ann.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }), [announcements, searchQuery, priorityFilter]);

  const sortedAnnouncements = useMemo(() => [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [filteredAnnouncements]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-lc-border';
      case 'Important':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-lc-border';
      default:
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-lc-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Important': return <Bell className="w-3.5 h-3.5" />;
      default: return <Info className="w-3.5 h-3.5" />;
    }
  };

  const refreshAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };

  const handleDelete = (id: string) => {
    deleteAnnouncementById(id);
    refreshAnnouncements();
    toast.success('Announcement deleted');
  };

  const handleTogglePin = (id: string) => {
    toggleAnnouncementPin(id);
    refreshAnnouncements();
    toast.success('Pin status updated');
  };

  const stats = {
    total: announcements.length,
    pinned: announcements.filter(a => a.isPinned).length,
    urgent: announcements.filter(a => a.priority === 'Urgent').length,
    totalViews: announcements.reduce((sum, a) => sum + a.views, 0),
  };

  return (
    <Container size="xl" fullHeight>
      <PageHeader
        title="📢 Announcements"
        description="Create and manage notices for students"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Total Notices</p>
            <p className="text-xl font-bold text-gray-900 dark:text-lc-text">{stats.total}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Pinned</p>
            <p className="text-xl font-bold text-accent-600 dark:text-accent-400">{stats.pinned}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Urgent</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</p>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-lc-text-muted mb-1">Total Views</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalViews}</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Important">Important</option>
              <option value="Normal">Normal</option>
            </select>
            <button
              onClick={() => navigate('/admin/announcements/new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-accent-500/15 text-white dark:text-accent-400 dark:border dark:border-accent-500/30 rounded-lg hover:bg-primary-700 dark:hover:bg-accent-500/25 transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Notice
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {sortedAnnouncements.length === 0 ? (
          <Card className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 dark:text-lc-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-1">No announcements found</h3>
            <p className="text-sm text-gray-500 dark:text-lc-text-muted">Create a new notice or adjust filters</p>
          </Card>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`overflow-hidden hover:shadow-md transition-shadow ${announcement.isPinned ? 'border-l-4 border-l-accent-500 dark:border-l-accent-400' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && (
                        <Pin className="w-4 h-4 text-accent-500 dark:text-accent-400 flex-shrink-0" />
                      )}
                      <h3 className="text-base font-bold text-gray-900 dark:text-lc-text">{announcement.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-lc-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(announcement.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {announcement.targetAudience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {announcement.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expires: {formatDate(announcement.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${getPriorityStyle(announcement.priority)}`}>
                    {getPriorityIcon(announcement.priority)}
                    {announcement.priority}
                  </span>
                </div>

                <p className={`text-sm text-gray-600 dark:text-lc-text-muted mb-3 ${expandedAnnouncement === announcement.id ? '' : 'line-clamp-2'}`}>
                  {announcement.body}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-lc-border">
                  <button
                    onClick={() => setExpandedAnnouncement(expandedAnnouncement === announcement.id ? null : announcement.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedAnnouncement === announcement.id ? 'Less' : 'Read More'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedAnnouncement === announcement.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleTogglePin(announcement.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${announcement.isPinned
                      ? 'text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10'
                      : 'text-gray-600 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated'}`}
                  >
                    <Pin className="w-4 h-4" />
                    {announcement.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/announcements/edit/${announcement.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default AnnouncementsPage;
