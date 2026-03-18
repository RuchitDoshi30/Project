import nodemailer from 'nodemailer';

/**
 * Email Service — Nodemailer Transporter
 *
 * Supports Gmail, Outlook, or any custom SMTP.
 * Configure via SMTP_* env vars.
 * Falls back to a console-log-only mode when no SMTP config is present (dev mode).
 */

interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

// Build transporter lazily on first use
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('⚠️  SMTP not configured — emails will be logged to console only');
    // Create a "fake" transporter that just resolves
    transporter = {
      sendMail: async (mailOptions: any) => {
        console.log('📧 [DEV MODE] Email would be sent:');
        console.log(`   To: ${Array.isArray(mailOptions.to) ? mailOptions.to.length + ' recipients' : mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        return { messageId: `dev-${Date.now()}`, accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to] };
      },
      verify: async () => true,
    } as any;
    return transporter!;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send a single email
 */
export async function sendMail(options: SendMailOptions) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'placement@marwadiuniversity.ac.in';

  return t.sendMail({
    from: `"Placement Cell" <${from}>`,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

/**
 * Send bulk emails in batches (to avoid SMTP rate limits)
 * Sends to recipients in batches of `batchSize` with a delay between batches.
 */
export async function sendBulkMail(
  recipients: string[],
  subject: string,
  body: string,
  batchSize = 50,
  delayMs = 1000
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    try {
      // Use BCC for privacy — send to self, BCC the batch
      const t = getTransporter();
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'placement@marwadiuniversity.ac.in';

      await t.sendMail({
        from: `"Placement Cell" <${from}>`,
        to: from, // send to self
        bcc: batch.join(', '), // BCC all recipients
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'), // Simple text → HTML
      });

      sent += batch.length;
    } catch (err: any) {
      failed += batch.length;
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${err.message}`);
      console.error(`Email batch ${Math.floor(i / batchSize) + 1} failed:`, err.message);
    }

    // Delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed, errors };
}

/**
 * Verify SMTP connection
 */
export async function verifySmtp(): Promise<boolean> {
  try {
    const t = getTransporter();
    await t.verify();
    return true;
  } catch {
    return false;
  }
}
