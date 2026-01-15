import { Router, Response } from 'express';
import db from '../lib/db';
import { protect, AuthRequest, isAdmin } from '../middleware/auth';
import { createUser } from '../services/auth';

const router = Router();

router.use(protect);
router.use(isAdmin);

// Get all users
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, roles } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET email = $1, roles = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, roles, created_at, updated_at',
      [email, roles, id]
    );
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, roles } = req.body;
    const user = await createUser(email, password, undefined, roles);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
