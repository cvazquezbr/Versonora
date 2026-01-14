
import { Router, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { protect, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();

router.use(protect);

// Get all users
router.get('/', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      throw error;
    }
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, app_metadata } = req.body;
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(id, {
      email,
      app_metadata,
    });

    if (error) {
      throw error;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user
router.get('/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data: { user }, error } = await supabase.auth.admin.getUserById(id);
    if (error) {
      throw error;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post('/', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, app_metadata } = req.body;
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      app_metadata,
    });

    if (error) {
      throw error;
    }
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
