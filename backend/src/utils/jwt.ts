// backend/src/utils/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthUser } from '../types/auth';

const JWT_SECRET: jwt.Secret =
  process.env.JWT_SECRET || 'dev_secret_change_later';

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  '1h') as SignOptions['expiresIn'];

const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
};

export const signToken = (user: AuthUser): string => {
  return jwt.sign(user, JWT_SECRET, signOptions);
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
};