import mongoose, { Schema, Document, Model } from 'mongoose';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// TestCase Schema is embedded because it's tightly coupled to the Problem
export interface ITestCase extends Document {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const TestCaseSchema: Schema<ITestCase> = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
}, { _id: false }); // Disable _id for embedded testcases unless needed

export interface IProblem extends Document {
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  tags: string[];
  constraints?: string;
  testCases: ITestCase[];
  createdBy: mongoose.Types.ObjectId; // Referencing Admin User
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema: Schema<IProblem> = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Fast lookup by human-readable URL slug
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      index: true, // Filtering by difficulty
    },
    tags: [{ type: String, trim: true }],
    constraints: { type: String },
    testCases: {
      type: [TestCaseSchema],
      validate: [
        (val: ITestCase[]) => val.length > 0,
        'A problem must have at least one test case.'
      ]
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering problems commonly by tags and difficulty
ProblemSchema.index({ tags: 1, difficulty: 1 });
// Text index for full-text search functionally on Title and Description
ProblemSchema.index({ title: 'text', description: 'text' });

export const Problem: Model<IProblem> = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
