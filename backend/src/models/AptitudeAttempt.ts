import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAptitudeAttempt extends Document {
  testId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOption: number;
    isConfident?: boolean;
  }[];
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentPerQuestion?: Record<string, number>;
  idempotencyHash?: string;
  completedAt: Date;
}

const AptitudeAttemptSchema: Schema<IAptitudeAttempt> = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'AptitudeTest', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
        selectedOption: { type: Number, required: true },
        isConfident: { type: Boolean, default: false },
        _id: false, // Don't need implicit _id for embedded array items
      }
    ],
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 0 },
    passed: { type: Boolean, required: true },
    timeSpentPerQuestion: { type: Map, of: Number }, // Map of questionId string to Number (seconds)
    completedAt: { type: Date, default: Date.now },
    idempotencyHash: { type: String, index: false }, // Covered by compound index below
  },
  { timestamps: false }
);

// Indexes
// Very common querying behavior: Students fetching their own test attempts
AptitudeAttemptSchema.index({ userId: 1, testId: 1, completedAt: -1 });

// Analytics query: Get attempts for a specific test over time
AptitudeAttemptSchema.index({ testId: 1, completedAt: -1 });

// Idempotency: prevent duplicate attempts (same user + same content hash)
AptitudeAttemptSchema.index({ userId: 1, idempotencyHash: 1 }, { unique: true, sparse: true });

// Post hook to update UserProgress stat
AptitudeAttemptSchema.post('save', async function (doc: IAptitudeAttempt) {
   try {
     if (mongoose.models.UserProgress) {
       await mongoose.models.UserProgress.findOneAndUpdate(
         { userId: doc.userId },
         { 
           $inc: { aptitudeTestsTaken: 1 },
           $set: { lastActiveDate: new Date() }
         },
         { upsert: true }
       );
     }
   } catch (err) {
     console.error('Trigger Error in test attempt post save hook: ', err);
   }
});

export const AptitudeAttempt: Model<IAptitudeAttempt> = mongoose.models.AptitudeAttempt || mongoose.model<IAptitudeAttempt>('AptitudeAttempt', AptitudeAttemptSchema);
