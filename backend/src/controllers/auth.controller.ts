// backend/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { mockUsers } from '../config/mockUsers';
import { signToken } from '../utils/jwt';



export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};
