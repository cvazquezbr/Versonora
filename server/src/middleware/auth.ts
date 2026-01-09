import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }

  req.user = user;
  next();
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.app_metadata.roles as string[])?.includes('admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};
