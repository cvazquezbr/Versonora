import { Router, RequestHandler } from 'express';
import db from '../lib/db.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { createUser } from '../services/auth.js';

const router = Router();

router.use(protect as RequestHandler);
router.use(isAdmin as RequestHandler);

// Get all users
router.get('/', (async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as RequestHandler);

// Update a user
router.put('/:id', (async (req, res) => {
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
}) as RequestHandler);

// Delete a user
router.delete('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as RequestHandler);

// Get a single user
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, email, roles, created_at, updated_at FROM users WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as RequestHandler);

// Create a new user
router.post('/', (async (req, res) => {
  try {
    const { email, password, roles } = req.body;
    const user = await createUser(email, password, undefined, roles);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as RequestHandler);

export default router;
