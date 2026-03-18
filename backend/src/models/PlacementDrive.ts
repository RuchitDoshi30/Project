import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlacementDrive extends Document {
  companyName: string;
  companyLogo?: string;
  jobRole: string;
  packageLPA: string;
  driveDate: Date;
  lastDateToApply: Date;
  location: string;
  eligibleBranches: string[];
  minCGPA: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  rounds: string[];
  registeredStudents: number;
  selectedStudents: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementDriveSchema: Schema<IPlacementDrive> = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    companyLogo: { type: String, trim: true },
    jobRole: { type: String, required: true, trim: true },
    packageLPA: { type: String, required: true },
    driveDate: { type: Date, required: true },
    lastDateToApply: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    eligibleBranches: [{ type: String, trim: true }],
    minCGPA: { type: Number, required: true, min: 0, max: 10 },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' },
    rounds: [{ type: String, trim: true }],
    registeredStudents: { type: Number, default: 0 },
    selectedStudents: { type: Number, default: 0 },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

PlacementDriveSchema.index({ status: 1, driveDate: -1 });
PlacementDriveSchema.index({ companyName: 'text', jobRole: 'text' });

export const PlacementDrive: Model<IPlacementDrive> = mongoose.models.PlacementDrive || mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);
