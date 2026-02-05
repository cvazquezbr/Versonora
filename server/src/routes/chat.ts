import { Router, Response, Request, RequestHandler } from 'express';
import db from '../lib/db.js';
import { protect, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(protect as RequestHandler);

// Get conversations for the current user
// If admin, get all conversations
router.get('/conversations', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const isUserAdmin = authReq.user!.roles.includes('admin');

    let query = `
      SELECT c.*,
             u.email as user_email,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != $1) as unread_count
      FROM conversations c
      JOIN users u ON c.user_id = u.id
    `;

    const params: any[] = [userId];

    if (!isUserAdmin) {
      query += ` WHERE c.user_id = $2`;
      params.push(userId);
    }

    query += ` ORDER BY last_message_at DESC NULLS LAST, c.updated_at DESC`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Start a new conversation
router.post('/conversations', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User ID missing from request' });
    }

    const { title = 'Nova Conversa' } = req.body || {};

    console.log(`Creating new conversation for user ${userId} with title: ${title}`);

    const { rows } = await db.query(
      'INSERT INTO conversations (user_id, title, updated_at) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, title]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}) as any);

// Get messages for a conversation
router.get('/conversations/:id/messages', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const isUserAdmin = authReq.user!.roles.includes('admin');

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!isUserAdmin && conv.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { rows } = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [id, limit, offset]
    );

    // Mark as read when fetching
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE',
      [id, userId]
    );

    res.json(rows.reverse());
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Send a message
router.post('/conversations/:id/messages', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { content } = req.body;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const isUserAdmin = authReq.user!.roles.includes('admin');

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!isUserAdmin && conv.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { rows } = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, content]
    );

    await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);

    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Get total unread count
router.get('/unread-count', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const isUserAdmin = authReq.user!.roles.includes('admin');

    let query = '';
    const params: any[] = [userId];

    if (isUserAdmin) {
      query = 'SELECT COUNT(*) FROM messages WHERE is_read = FALSE AND sender_id NOT IN (SELECT id FROM users WHERE \'admin\' = ANY(roles))';
    } else {
      query = 'SELECT COUNT(*) FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.user_id = $1 AND m.is_read = FALSE AND m.sender_id != $1';
    }

    const { rows } = await db.query(query, isUserAdmin ? [] : params);
    res.json({ count: parseInt(rows[0].count) });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

export default router;
