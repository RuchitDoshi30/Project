import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import {
  getAnnouncementById,
  saveAnnouncement,
  type Announcement,
} from '../services/admin-content.service';

const AddAnnouncementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('Normal');
  const [targetAudience, setTargetAudience] = useState('All Students');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [author, setAuthor] = useState('Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const announcement = getAnnouncementById(id);
    if (!announcement) {
      toast.error('Announcement not found');
      navigate('/admin/announcements');
      return;
    }

    setTitle(announcement.title);
    setBody(announcement.body);
    setPriority(announcement.priority);
    setTargetAudience(announcement.targetAudience);
    setExpiresAt(announcement.expiresAt.slice(0, 10));
    setIsPinned(announcement.isPinned);
    setAuthor(announcement.author);
  }, [id, isEditMode, navigate]);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !targetAudience.trim() || !expiresAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`${isEditMode ? 'Updating' : 'Creating'} announcement...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existing = isEditMode && id ? getAnnouncementById(id) : undefined;
      const payload: Announcement = {
        id: existing?.id || Date.now().toString(),
        title: title.trim(),
        body: body.trim(),
        priority,
        targetAudience: targetAudience.trim(),
        createdAt: existing?.createdAt || new Date().toISOString(),
        expiresAt: new Date(`${expiresAt}T23:59:00`).toISOString(),
        isPinned,
        author: author.trim() || 'Admin',
        views: existing?.views || 0,
      };

      saveAnnouncement(payload);

      toast.success(`Announcement ${isEditMode ? 'updated' : 'created'} successfully!`, { id: toastId });
      navigate('/admin/announcements');
    } catch {
      toast.error('Failed to save announcement. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-lc-bg py-6">
      <Container>
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/announcements')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-lc-text-muted hover:text-gray-900 dark:hover:text-lc-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Announcements
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-lc-text mb-1">
              {isEditMode ? 'Edit Announcement' : 'Create New Announcement'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-lc-text-muted">
              {isEditMode ? 'Update notice details and publish settings' : 'Create a new notice for students'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="border-b border-gray-200 dark:border-lc-border pb-4 mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-lc-text">Announcement Details</h2>
                <p className="text-sm text-gray-500 dark:text-lc-text-muted mt-1">Provide clear information for students</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Campus Drive Registration Open"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary uppercase tracking-wide mb-2">
                    Notice Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write complete details about the announcement..."
                    rows={8}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-lc-border-light dark:bg-lc-card dark:text-lc-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-4 uppercase tracking-wide">Publish Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-lc-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-lc-card dark:text-lc-text"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., CS, IT — Batch 2026"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-lc-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-lc-card dark:text-lc-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-lc-text-secondary mb-2">
                    Expires On <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-lc-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-lc-card dark:text-lc-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-lc-text-secondary mb-2">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-lc-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-lc-card dark:text-lc-text"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-lc-text-secondary">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  Pin this announcement
                </label>

                <div className="pt-4 border-t dark:border-lc-border space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? 'Update' : 'Publish'} Announcement
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/admin/announcements')}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddAnnouncementPage;
