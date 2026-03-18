import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  problemsSolved: {
    easy: number;
    medium: number;
    hard: number;
  };
  aptitudeTestsTaken: number;
  lastActiveDate: Date;
  totalSubmissions: number;
}

const UserProgressSchema: Schema<IUserProgress> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true // 1:1 Relationship with User
    },
    problemsSolved: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    aptitudeTestsTaken: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    totalSubmissions: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Auto populate createdAt / updatedAt
  }
);

export const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
