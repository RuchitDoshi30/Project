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


// Mongoose Pre-Hook
SubmissionSchema.pre('save', function(this: ISubmission) {
  // Ensure we set submittedAt just in case
  if (!this.submittedAt) {
    this.submittedAt = new Date();
  }
});

// Mongoose Post-Hook for Stats Update (Trigger Equivalent)
// When a submission is marked as 'Accepted', update the User's solved stats
SubmissionSchema.post('save', async function (doc: ISubmission) {
  try {
    if (mongoose.models.UserProgress) {
      // Always increment total submissions
      await mongoose.models.UserProgress.findOneAndUpdate(
        { userId: doc.userId },
        { 
          $inc: { totalSubmissions: 1 },
          $set: { lastActiveDate: new Date() }
        },
        { upsert: true }
      );

      // If status changed to 'Accepted', we might want to check if it's the first time they solved it.
      // Usually requires checking if a "Solved" record already exists in a UserProblemProgress mapping.
      // For this simplified derived hook, we'd fire an event or pipeline, but here's a basic integration:
      if (doc.status === 'Accepted') {
        const problem = await mongoose.models.Problem.findById(doc.problemId).select('difficulty');
        if (problem) {
          const difficultyMap: Record<string, string> = {
            'Beginner': 'problemsSolved.easy',
            'Intermediate': 'problemsSolved.medium',
            'Advanced': 'problemsSolved.hard'
          };
          
          const difficultyField = difficultyMap[problem.difficulty as string];
          if (difficultyField) {
             await mongoose.models.UserProgress.findOneAndUpdate(
               { userId: doc.userId },
               { $inc: { [difficultyField]: 1 } }
             );
          }
        }
      }
    }
  } catch (err) {
    console.error('Trigger error in Submission post-save:', err);
  }
});

export const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
