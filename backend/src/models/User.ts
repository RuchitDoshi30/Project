import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 10;

export interface IUser extends Document {
  name: string;
  email: string;
  universityId: string;
  role: 'admin' | 'student';
  passwordHash: string;
  branch?: string;
  semester?: number;
  enrollmentYear?: number;
  accountStatus: 'active' | 'disabled';
  bio?: string;
  notifications: {
    emailOnSubmission: boolean;
    emailOnTestComplete: boolean;
    emailWeeklySummary: boolean;
    inAppNotifications: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showInLeaderboard: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    universityId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // Frequent lookup by university Id (e.g., student login)
    },
    role: { type: String, enum: ['admin', 'student'], default: 'student', index: true },
    passwordHash: { type: String, required: true, select: false }, // Hidden by default
    branch: { type: String, trim: true },
    semester: { type: Number, min: 1, max: 8 },
    enrollmentYear: { type: Number },
    accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    notifications: {
      emailOnSubmission: { type: Boolean, default: true },
      emailOnTestComplete: { type: Boolean, default: true },
      emailWeeklySummary: { type: Boolean, default: true },
      inAppNotifications: { type: Boolean, default: true },
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      showInLeaderboard: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index for role + status filtering (field-level indexes on email/universityId already set above)
UserSchema.index({ role: 1, accountStatus: 1 });

// Mongoose Hooks (Triggers Equivalent)
// Hash the password before saving
UserSchema.pre('save', async function (this: IUser) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Post Hook example: Automate progress tracking on user creation
UserSchema.post('save', async function (doc: IUser) {
  // If the user was just created and is a student, we can trigger initialization of their UserProgress
  if (doc.role === 'student') {
    const defaultProgress = {
      userId: doc._id,
      problemsSolved: { easy: 0, medium: 0, hard: 0 },
      aptitudeTestsTaken: 0,
      totalSubmissions: 0,
      lastActiveDate: new Date()
    };
    try {
      if (mongoose.models.UserProgress) {
        // Prevent duplicate creation with update/upsert
        await mongoose.models.UserProgress.findOneAndUpdate(
          { userId: doc._id },
          { $setOnInsert: defaultProgress },
          { upsert: true }
        );
      }
    } catch(err) {
      console.error('Error initializing user progress:', err);
    }
  }
});

// Methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if model already exists to prevent OverwriteModelError during hot reload
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
