import mongoose, { Schema, Document, Model } from 'mongoose';
import { AptitudeCategory } from './AptitudeQuestion';

export interface IAptitudeTest extends Document {
  title: string;
  description: string;
  category: AptitudeCategory;
  questions: mongoose.Types.ObjectId[]; // Array of references to AptitudeQuestion
  duration: number; // in minutes
  passingPercentage: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AptitudeTestSchema: Schema<IAptitudeTest> = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Quantitative', 'Logical', 'Verbal', 'Technical'],
      required: true,
      index: true,
    },
    questions: [
      { type: Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true }
    ],
    duration: { type: Number, required: true, min: 1 }, // Duration in minutes
    passingPercentage: { type: Number, required: true, min: 1, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const AptitudeTest: Model<IAptitudeTest> = mongoose.models.AptitudeTest || mongoose.model<IAptitudeTest>('AptitudeTest', AptitudeTestSchema);
