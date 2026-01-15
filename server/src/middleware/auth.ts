import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

interface UserPayload {
  userId: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user && user.roles.includes('admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};
