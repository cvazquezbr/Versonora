import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

interface UserPayload {
  userId: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  userPayload?: UserPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.warn(`[Auth] Missing token for ${req.method} ${req.path}. Header present: ${!!authHeader}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    console.log(`[Auth] Token verified for user ${decoded.userId} on ${req.method} ${req.path}`);
    req.userPayload = decoded;
    next();
  } catch (error: any) {
    console.error(`[Auth] Token verification failed for ${req.method} ${req.path}:`, error.message);
    return res.status(401).json({ error: `Unauthorized: Invalid token (${error.message})` });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.userPayload;
  if (user && user.roles.includes('admin')) {
    next();
  } else {
    console.warn(`[Auth] Admin access denied for user ${user?.userId}`);
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};
