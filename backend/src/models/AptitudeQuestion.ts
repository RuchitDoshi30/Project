import mongoose, { Schema, Document, Model } from 'mongoose';

export type AptitudeCategory = 'Quantitative' | 'Logical' | 'Verbal' | 'Technical';
import { DifficultyLevel } from './Problem';

export interface IAptitudeQuestion extends Document {
  question: string;
  options: string[];
  correctOptionIndex: number;
  category: AptitudeCategory;
  difficulty: DifficultyLevel;
  explanation?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AptitudeQuestionSchema: Schema<IAptitudeQuestion> = new Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: [
        (val: string[]) => val.length >= 2,
        'A question must have at least 2 options.'
      ],
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['Quantitative', 'Logical', 'Verbal', 'Technical'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      index: true,
    },
    explanation: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Pre-hook for custom validation logic: ensure correctOptionIndex is within bounds of options array length
AptitudeQuestionSchema.pre('save', function (this: IAptitudeQuestion) {
  if (this.options && this.correctOptionIndex >= this.options.length) {
    throw new Error('correctOptionIndex exceeds the bounds of the options array');
  }
});

// Indexes for common admin operations and generating random tests by category/difficulty
AptitudeQuestionSchema.index({ category: 1, difficulty: 1 });

export const AptitudeQuestion: Model<IAptitudeQuestion> = mongoose.models.AptitudeQuestion || mongoose.model<IAptitudeQuestion>('AptitudeQuestion', AptitudeQuestionSchema);
