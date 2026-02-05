import { Router, Response, Request, RequestHandler } from 'express';
import db from '../lib/db.js';
import { protect, AuthRequest, isAdmin } from '../middleware/auth.js';
import { createUser } from '../services/auth.js';

const router = Router();

router.use(protect as RequestHandler);
router.use(isAdmin as RequestHandler);

// Get all users
router.get('/', (async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users');
    res.json(rows);
  } catch (error: any) {
    console.error('[Admin] Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Update a user
router.put('/:id', (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, roles } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET email = $1, roles = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, roles, created_at, updated_at',
      [email, roles, id]
    );
    res.json(rows[0]);
  } catch (error: any) {
    console.error('[Admin] Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Delete a user
router.delete('/:id', (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    console.error('[Admin] Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Get a single user
router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error: any) {
    console.error('[Admin] Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Create a new user
router.post('/', (async (req: Request, res: Response) => {
  try {
    const { email, password, roles } = req.body;
    const user = await createUser(email, password, undefined, roles);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('[Admin] Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

export default router;
