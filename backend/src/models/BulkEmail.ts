import mongoose, { Schema, type Document } from 'mongoose';

export interface IBulkEmail extends Document {
  subject: string;
  body: string;
  filters: {
    branches: string[];
    batch: string;
    minCGPA?: number;
  };
  recipientCount: number;
  status: 'Delivered' | 'Sending' | 'Failed';
  sentBy: mongoose.Types.ObjectId;
  sentAt: Date;
}

const bulkEmailSchema = new Schema<IBulkEmail>(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    filters: {
      branches: [{ type: String }],
      batch: { type: String, required: true },
      minCGPA: { type: Number },
    },
    recipientCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Delivered', 'Sending', 'Failed'], default: 'Delivered' },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bulkEmailSchema.index({ sentAt: -1 });

export const BulkEmail = mongoose.model<IBulkEmail>('BulkEmail', bulkEmailSchema);
