import type { Request, Response, NextFunction } from 'express';
import { BulkEmail } from '../models/BulkEmail';
import { User } from '../models';
import { sendBulkMail } from '../services/email.service';

/**
 * Build a Mongoose query filter from the frontend filter params.
 * Maps branch short codes (CS, IT, EC…) to full branch names stored in the DB.
 */
const BRANCH_MAP: Record<string, string> = {
  CS: 'Computer Science',
  IT: 'Information Technology',
  CE: 'Computer Engineering',
  EC: 'Electronics & Communication',
  EE: 'Electrical Engineering',
  ME: 'Mechanical',
  CV: 'Civil',
};

function buildStudentQuery(filters: any) {
  const query: any = { role: 'student', accountStatus: 'active' };

  if (filters?.branches && filters.branches.length > 0) {
    const fullBranches = filters.branches.map((b: string) => BRANCH_MAP[b] || b);
    query.branch = { $in: fullBranches };
  }

  // The frontend sends batch year as string (e.g. "2026").
  // Students have an enrollmentYear field.
  if (filters?.batch) {
    query.enrollmentYear = parseInt(filters.batch, 10) || undefined;
  }

  return query;
}

/**
 * GET /bulk-emails/recipients-count?branches=CS,IT&batch=2026&minCGPA=7
 * Returns the real recipient count based on filters.
 */
export const getRecipientsCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = (req.query.branches as string)?.split(',').filter(Boolean) || [];
    const batch = req.query.batch as string || '2026';
    const query = buildStudentQuery({ branches, batch });

    const count = await User.countDocuments(query);
    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /bulk-emails
 * Actually sends emails to matching students, then saves a record.
 */
export const sendBulkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, body, filters } = req.body;
    const userId = req.user?.id;

    if (!subject || !body) {
      res.status(400).json({ success: false, message: 'Subject and body are required' });
      return;
    }

    // 1. Find matching student emails
    const query = buildStudentQuery(filters);
    const students = await User.find(query).select('email').lean();
    const recipientEmails = students.map((s: any) => s.email).filter(Boolean);

    if (recipientEmails.length === 0) {
      res.status(400).json({ success: false, message: 'No matching recipients found' });
      return;
    }

    // 2. Create DB record with status 'Sending'
    const emailRecord = await BulkEmail.create({
      subject,
      body,
      filters: {
        branches: filters?.branches || [],
        batch: filters?.batch || '2026',
        minCGPA: filters?.minCGPA,
      },
      recipientCount: recipientEmails.length,
      status: 'Sending',
      sentBy: userId,
      sentAt: new Date(),
    });

    // 3. Actually send emails (in batches)
    const result = await sendBulkMail(recipientEmails, subject, body);

    // 4. Update status based on result
    const finalStatus = result.failed === 0 ? 'Delivered' : (result.sent === 0 ? 'Failed' : 'Delivered');
    emailRecord.status = finalStatus;
    emailRecord.recipientCount = result.sent;
    await emailRecord.save();

    res.status(201).json({
      success: true,
      data: emailRecord,
      emailResult: {
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
        totalRecipients: recipientEmails.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBulkEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);
    const skip = (page - 1) * limit;

    const total = await BulkEmail.countDocuments();
    const emails = await BulkEmail.find()
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sentBy', 'name email')
      .lean();

    res.json({
      success: true,
      data: emails,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBulkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BulkEmail.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Email record deleted' });
  } catch (err) {
    next(err);
  }
};
