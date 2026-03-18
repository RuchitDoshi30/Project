import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  body: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: string;
  expiresAt: Date;
  isPinned: boolean;
  author: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
    targetAudience: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
    isPinned: { type: Boolean, default: false },
    author: { type: String, required: true, trim: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isPinned: -1, createdAt: -1 });
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
