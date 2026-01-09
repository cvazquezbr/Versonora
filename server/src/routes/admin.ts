import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// Get all users
router.get('/', protect, admin, async (req, res) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(req.params.id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', protect, admin, async (req, res) => {
  const { email, app_metadata } = req.body;

  try {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      req.params.id,
      { email, app_metadata }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
