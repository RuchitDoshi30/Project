import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubmissionStatus = 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Pending Review';

export interface ISubmission extends Document {
  problemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: SubmissionStatus;
  executionTime?: number;
  memory?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  idempotencyHash?: string;
  submittedAt: Date;
}

const SubmissionSchema: Schema<ISubmission> = new Schema(
  {
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true, default: 'javascript' },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending Review'],
      default: 'Pending Review',
      index: false, // Covered by compound index { status: 1, submittedAt: -1 }
    },
    executionTime: { type: Number }, // in milliseconds
    memory: { type: Number }, // in kilobytes
    testCasesPassed: { type: Number },
    totalTestCases: { type: Number },
    idempotencyHash: { type: String, index: false }, // Covered by compound index below
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We use custom submittedAt mostly, but standardizing avoids confusion. Let's rely on submittedAt. 
  }
);

// Compound Indexing for optimal lookups and performance
// Very common query: Find all submissions of a specific user for a specific problem 
SubmissionSchema.index({ userId: 1, problemId: 1, submittedAt: -1 });

// Filtering submissions by status (e.g. admin reviewing Pending ones)
SubmissionSchema.index({ status: 1, submittedAt: -1 });

// Idempotency: prevent duplicate submissions (same user + same content hash)
SubmissionSchema.index({ userId: 1, idempotencyHash: 1 }, { unique: true, sparse: true });


// Mongoose Pre-Hook
SubmissionSchema.pre('save', function(this: ISubmission) {
  // Ensure we set submittedAt just in case
  if (!this.submittedAt) {
    this.submittedAt = new Date();
  }
});

// Mongoose Post-Hook for Stats Update (Trigger Equivalent)
// Increment totalSubmissions count and update lastActiveDate
SubmissionSchema.post('save', async function (doc: ISubmission) {
  try {
    if (mongoose.models.UserProgress) {
      await mongoose.models.UserProgress.findOneAndUpdate(
        { userId: doc.userId },
        { 
          $inc: { totalSubmissions: 1 },
          $set: { lastActiveDate: new Date() }
        },
        { upsert: true }
      );
      // NOTE: problemsSolved is managed exclusively by approveSubmission controller
      // inside a transaction to prevent double-counting.
    }
  } catch (err) {
    console.error('Trigger error in Submission post-save:', err);
  }
});

export const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
