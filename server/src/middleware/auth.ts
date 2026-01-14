
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user && user.app_metadata.roles.includes('admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};
