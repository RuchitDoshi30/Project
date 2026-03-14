import { useState } from 'react';
import { Container, PageHeader, Card } from '../components';
import {
    Mail, Send, Users, Filter, FileText, Eye,
    CheckCircle, Clock, X,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Bulk Email Page
 *
 * Admin interface for composing and sending bulk emails to students.
 * Features: Recipient filters, templates, preview, send confirmation.
 */

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

interface SentEmail {
    id: string;
    subject: string;
    recipientCount: number;
    filters: string;
    sentAt: string;
    status: 'Delivered' | 'Sending' | 'Failed';
}

const emailTemplates: EmailTemplate[] = [
    {
        id: 't1',
        name: '📋 Drive Reminder',
        subject: '[{company}] Campus Drive Reminder — {date}',
        body: `Dear Students,

This is to remind you that {company} will be conducting a campus recruitment drive on {date}.

Eligibility: {branches} with minimum CGPA {cgpa}
Venue: {venue}
Reporting Time: 9:00 AM

Please ensure you carry the following:
- 2 copies of your updated resume
- College ID card
- All semester mark sheets (originals + photocopies)
- 2 passport-size photographs

Dress Code: Formal (No jeans, T-shirts, or sneakers)

Best of luck!

Regards,
Training & Placement Cell`,
    },
    {
        id: 't2',
        name: '📝 Document Submission',
        subject: 'Document Submission Required — Deadline {date}',
        body: `Dear Students,

You are required to submit the following documents to the Placement Cell office by {date}:

1. Updated Resume (PDF format)
2. Consolidated Mark Sheet
3. No Objection Certificate (if applicable)
4. Passport-size Photographs (2 copies)

Submission Mode: Online through the Placement Portal
Office Hours: 10:00 AM - 4:00 PM (Monday to Friday)

Late submissions will NOT be accepted.

Regards,
Training & Placement Cell`,
    },
    {
        id: 't3',
        name: '🎯 Interview Schedule',
        subject: '[{company}] Interview Schedule — {date}',
        body: `Dear Students,

Your interview with {company} has been scheduled. Please find the details below:

Date: {date}
Time: {time}
Venue: {venue}
Round: {round}

Important Instructions:
- Report 30 minutes before your scheduled time
- Carry all original documents
- Be prepared with your project explanations
- Formal dress code is mandatory

Contact the Placement Cell for any queries.

All the best!

Regards,
Training & Placement Cell`,
    },
    {
        id: 't4',
        name: '🎉 Selection Congratulations',
        subject: 'Congratulations! You have been selected by {company}',
        body: `Dear Student,

We are pleased to inform you that you have been selected by {company} for the position of {role}.

Package: {package} LPA
Joining Date: To be communicated

Please complete the following formalities:
1. Accept the offer on the placement portal within 48 hours
2. Submit your acceptance letter to the Placement Cell
3. Complete the background verification form

Congratulations once again! We are proud of your achievement.

Regards,
Training & Placement Cell`,
    },
];

const recentEmails: SentEmail[] = [
    {
        id: '1',
        subject: '[TCS Digital] Campus Drive Reminder — Feb 20',
        recipientCount: 45,
        filters: 'CS, IT · Batch 2026 · CGPA ≥ 7.0',
        sentAt: '2026-02-14T10:30:00Z',
        status: 'Delivered',
    },
    {
        id: '2',
        subject: 'Document Submission Required — Deadline Feb 18',
        recipientCount: 234,
        filters: 'All Branches · Final Year',
        sentAt: '2026-02-12T14:00:00Z',
        status: 'Delivered',
    },
    {
        id: '3',
        subject: '[Amazon] Interview Schedule — Feb 10',
        recipientCount: 38,
        filters: 'CS, IT · Batch 2026 · CGPA ≥ 7.5',
        sentAt: '2026-02-08T09:00:00Z',
        status: 'Delivered',
    },
    {
        id: '4',
        subject: 'Congratulations! You have been selected by Wipro',
        recipientCount: 32,
        filters: 'Selected candidates · Wipro Drive',
        sentAt: '2026-01-20T16:30:00Z',
        status: 'Delivered',
    },
];

const branches = ['CS', 'IT', 'EC', 'EE', 'ME', 'CE'];
const batches = ['2024', '2025', '2026', '2027'];

const BulkEmailPage = () => {
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('2026');
    const [minCGPA, setMinCGPA] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

    // Calculate mock recipient count based on filters
    const getRecipientCount = () => {
        let count = 0;
        const branchMultiplier = selectedBranches.length === 0 ? branches.length : selectedBranches.length;
        count = branchMultiplier * 30; // ~30 students per branch
        if (minCGPA && parseFloat(minCGPA) > 6) {
            count = Math.round(count * (1 - (parseFloat(minCGPA) - 6) * 0.15));
        }
        return Math.max(count, 5);
    };

    const handleBranchToggle = (branch: string) => {
        setSelectedBranches(prev =>
            prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
        );
    };

    const handleSelectTemplate = (template: EmailTemplate) => {
        setSubject(template.subject);
        setBody(template.body);
        toast.success(`Template "${template.name}" loaded`);
    };

    const handleSend = () => {
        if (!subject.trim() || !body.trim()) {
            toast.error('Please fill in subject and body');
            return;
        }
        setSending(true);
        setTimeout(() => {
            setSending(false);
            toast.success(`📧 Email sent to ${getRecipientCount()} students successfully!`);
            setSubject('');
            setBody('');
            setSelectedBranches([]);
            setShowPreview(false);
        }, 1500);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Container size="xl" fullHeight>
            <PageHeader
                title="📧 Send Email"
                description="Compose and send bulk emails to students filtered by branch, batch, and CGPA"
            />

            {/* Tab Switch */}
            <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-lc-elevated rounded-lg p-1 w-fit">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'compose'
                        ? 'bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text shadow-sm'
                        : 'text-gray-600 dark:text-lc-text-muted hover:text-gray-900 dark:hover:text-lc-text'
                        }`}
                    aria-pressed={activeTab === 'compose'}
                >
                    <Mail className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                    Compose
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'history'
                        ? 'bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text shadow-sm'
                        : 'text-gray-600 dark:text-lc-text-muted hover:text-gray-900 dark:hover:text-lc-text'
                        }`}
                    aria-pressed={activeTab === 'history'}
                >
                    <Clock className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                    Sent History
                </button>
            </div>

            {activeTab === 'compose' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Compose */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Recipients Filter */}
                        <Card className="p-5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                Recipients
                            </h3>

                            {/* Branch Selection */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">
                                    Branch (leave empty for all)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {branches.map(branch => (
                                        <button
                                            key={branch}
                                            onClick={() => handleBranchToggle(branch)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedBranches.includes(branch)
                                                ? 'bg-primary-600 dark:bg-accent-500/15 text-white dark:text-accent-400 border-primary-600 dark:border-accent-500/30'
                                                : 'bg-gray-50 dark:bg-lc-elevated text-gray-700 dark:text-lc-text-secondary border-gray-200 dark:border-lc-border hover:border-gray-300 dark:hover:border-lc-border-light'
                                                }`}
                                        >
                                            {branch}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Batch & CGPA */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Batch</label>
                                    <select
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
                                    >
                                        {batches.map(batch => (
                                            <option key={batch} value={batch}>{batch}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Min CGPA (optional)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="10"
                                        value={minCGPA}
                                        onChange={(e) => setMinCGPA(e.target.value)}
                                        placeholder="e.g. 7.0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Recipient Count */}
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-lc-border">
                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    📬 Email will be sent to <strong>{getRecipientCount()}</strong> students
                                    <span className="text-blue-500 dark:text-blue-400 text-xs ml-2">
                                        ({selectedBranches.length === 0 ? 'All Branches' : selectedBranches.join(', ')} · Batch {selectedBatch}
                                        {minCGPA && ` · CGPA ≥ ${minCGPA}`})
                                    </span>
                                </p>
                            </div>
                        </Card>

                        {/* Compose Area */}
                        <Card className="p-5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                Compose Email
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Email subject line..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-lc-text-secondary mb-2">Body</label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={12}
                                        placeholder="Type your message here..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-lc-border-light bg-white dark:bg-lc-card text-gray-900 dark:text-lc-text rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500 focus:border-transparent resize-none font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setShowPreview(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated border border-gray-300 dark:border-lc-border rounded-lg transition-all"
                                    >
                                        <Eye className="w-4 h-4" aria-hidden="true" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || !subject.trim() || !body.trim()}
                                        className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg transition-all ${sending || !subject.trim() || !body.trim()
                                            ? 'bg-gray-300 dark:bg-lc-elevated text-gray-500 dark:text-lc-text-muted cursor-not-allowed'
                                            : 'bg-green-600 dark:bg-green-500/15 text-white dark:text-green-400 dark:border dark:border-green-500/30 hover:bg-green-700 dark:hover:bg-green-500/25'
                                            }`}
                                    >
                                        <Send className="w-4 h-4" aria-hidden="true" />
                                        {sending ? 'Sending...' : `Send to ${getRecipientCount()} Students`}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Templates */}
                    <div className="space-y-4">
                        <Card className="p-5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
                                Quick Templates
                            </h3>
                            <div className="space-y-2">
                                {emailTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-lc-border hover:border-gray-300 dark:hover:border-lc-border-light hover:bg-gray-50 dark:hover:bg-lc-elevated transition-all group"
                                    >
                                        <p className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-1 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">
                                            {template.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-lc-text-muted line-clamp-2">
                                            {template.subject}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* Sent History Tab */
                <div className="space-y-3">
                    {recentEmails.map(email => (
                        <Card key={email.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-lc-text mb-1">{email.subject}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-lc-text-muted">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                                                {email.recipientCount} recipients
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                                                {email.filters}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                                {formatDate(email.sentAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-lc-border">
                                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {email.status}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div
                    className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="email-preview-title"
                >
                    <div className="bg-white dark:bg-lc-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-lc-border">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-lc-border">
                            <h3 id="email-preview-title" className="text-base font-bold text-gray-900 dark:text-lc-text">
                                Email Preview
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg transition-all"
                                aria-label="Close preview"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-lc-text-muted" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-lc-text-muted mb-1">To</p>
                                <p className="text-sm text-gray-900 dark:text-lc-text">
                                    {getRecipientCount()} students
                                    ({selectedBranches.length === 0 ? 'All Branches' : selectedBranches.join(', ')} · Batch {selectedBatch})
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-lc-text-muted mb-1">Subject</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-lc-text">{subject || '(No subject)'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-lc-text-muted mb-1">Body</p>
                                <div className="bg-gray-50 dark:bg-lc-elevated rounded-lg p-4 border border-gray-200 dark:border-lc-border">
                                    <pre className="text-sm text-gray-700 dark:text-lc-text-secondary whitespace-pre-wrap font-sans">{body || '(No content)'}</pre>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-lc-border">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-lc-text-secondary hover:bg-gray-50 dark:hover:bg-lc-elevated border border-gray-300 dark:border-lc-border rounded-lg transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { setShowPreview(false); handleSend(); }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-green-600 dark:bg-green-500/15 text-white dark:text-green-400 dark:border dark:border-green-500/30 rounded-lg hover:bg-green-700 dark:hover:bg-green-500/25 transition-all"
                            >
                                <Send className="w-4 h-4" aria-hidden="true" />
                                Confirm & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default BulkEmailPage;
