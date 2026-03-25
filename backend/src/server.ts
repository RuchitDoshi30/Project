import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();

// --- ENV validation (M5) ---
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of requiredVars) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`FATAL: Missing required env var: ${key}`);
      process.exit(1);
    } else {
      console.warn(`WARNING: Missing env var ${key}, using dev default`);
    }
  }
}

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
