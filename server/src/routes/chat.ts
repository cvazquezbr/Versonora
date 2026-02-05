import { Router, Response, Request, RequestHandler } from 'express';
import db from '../lib/db.js';
import { protect, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(protect as RequestHandler);

// Handle database errors specifically for missing tables
const handleDbError = (res: Response, error: any, context: string) => {
  console.error(`[Chat] Database error during ${context}:`, error);
  if (error.code === '42P01') {
    return res.status(500).json({ error: 'Database schema not fully initialized. Please try again in a few seconds.' });
  }
  res.status(500).json({ error: error.message || 'Internal Server Error' });
};

// Get conversations for the current user
// If admin, get all conversations
router.get('/conversations', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userPayload?.userId;
    if (!userId) {
        console.error('[Chat] userId missing in request after protect middleware');
        return res.status(401).json({ error: 'Unauthorized: User identity lost' });
    }

    const isUserAdmin = authReq.userPayload!.roles.includes('admin');
    const { filter } = req.query;

    let query = `
      SELECT c.*,
             u.email as user_email,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != $1) as unread_count
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [userId];

    if (!isUserAdmin) {
      query += ` AND c.user_id = $2`;
      params.push(userId);
    } else if (filter === 'unread') {
      query += ` AND (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != $1) > 0`;
    } else if (filter === 'unanswered') {
      query += ` AND (
        SELECT sender_id FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC LIMIT 1
      ) NOT IN (SELECT id FROM users WHERE 'admin' = ANY(roles))`;
    }

    query += ` ORDER BY last_message_at DESC NULLS LAST, c.updated_at DESC`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error: any) {
    handleDbError(res, error, 'fetching conversations');
  }
}) as any);

// Start a new conversation
router.post('/conversations', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userPayload?.userId;
    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    if (!userId) {
      console.error('[Chat] userId missing in request during POST /conversations');
      return res.status(401).json({ error: 'Unauthorized: User identity lost' });
    }

    const { title = 'Nova Conversa', target_user_id } = req.body || {};

    // If admin and target_user_id is provided, create conversation for that user
    const ownerId = (isUserAdmin && target_user_id) ? target_user_id : userId;

    console.log(`[Chat] Creating new conversation for user ${ownerId} with title: ${title}`);

    const { rows } = await db.query(
      'INSERT INTO conversations (user_id, title, updated_at) VALUES ($1, $2, NOW()) RETURNING *',
      [ownerId, title]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    handleDbError(res, error, 'creating conversation');
  }
}) as any);

// Get messages for a conversation
router.get('/conversations/:id/messages', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.userPayload?.userId;
    if (!userId) {
        console.error('[Chat] userId missing in request during GET messages');
        return res.status(401).json({ error: 'Unauthorized: User identity lost' });
    }

    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!isUserAdmin && conv.rows[0].user_id !== userId) {
      console.warn(`[Chat] Access denied for user ${userId} to conversation ${id}`);
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
    handleDbError(res, error, 'fetching messages');
  }
}) as any);

// Send a message
router.post('/conversations/:id/messages', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { content } = req.body;
    const userId = authReq.userPayload?.userId;
    if (!userId) {
        console.error('[Chat] userId missing in request during POST message');
        return res.status(401).json({ error: 'Unauthorized: User identity lost' });
    }

    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!isUserAdmin && conv.rows[0].user_id !== userId) {
      console.warn(`[Chat] Access denied for user ${userId} to conversation ${id}`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { rows } = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, content]
    );

    await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);

    res.status(201).json(rows[0]);
  } catch (error: any) {
    handleDbError(res, error, 'sending message');
  }
}) as any);

// Rename a conversation
router.put('/conversations/:id', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { title } = req.body;
    const userId = authReq.userPayload?.userId;
    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });
    if (!isUserAdmin && conv.rows[0].user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await db.query(
      'UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [title, id]
    );
    res.json(rows[0]);
  } catch (error: any) {
    handleDbError(res, error, 'renaming conversation');
  }
}) as any);

// Delete a conversation (Reset)
router.delete('/conversations/:id', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.userPayload?.userId;
    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify access
    const conv = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });
    if (!isUserAdmin && conv.rows[0].user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    await db.query('DELETE FROM conversations WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error: any) {
    handleDbError(res, error, 'deleting conversation');
  }
}) as any);

// Delete an unread message
router.delete('/messages/:id', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.userPayload?.userId;
    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership and read status
    const msg = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
    if (msg.rows.length === 0) return res.status(404).json({ error: 'Message not found' });

    // Only allow deletion of own unread messages, or admin deletion (maybe admin should only delete their own too or any unread?)
    // Request says "excluir mensagem ainda não lida" - usually means the one you sent.
    if (msg.rows[0].sender_id !== userId && !isUserAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (msg.rows[0].is_read && !isUserAdmin) {
      return res.status(400).json({ error: 'Cannot delete read message' });
    }

    await db.query('DELETE FROM messages WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error: any) {
    handleDbError(res, error, 'deleting message');
  }
}) as any);

// Get total unread count
router.get('/unread-count', (async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userPayload?.userId;
    if (!userId) {
        console.error('[Chat] userId missing in request during unread-count');
        return res.status(401).json({ error: 'Unauthorized: User identity lost' });
    }

    const isUserAdmin = authReq.userPayload!.roles.includes('admin');

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
    handleDbError(res, error, 'getting unread count');
  }
}) as any);

export default router;
