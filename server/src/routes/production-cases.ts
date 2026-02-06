import { Router, Response, Request, RequestHandler } from 'express';
import db from '../lib/db.js';
import { protect, AuthRequest, isAdmin } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import multer from 'multer';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
let isLocalStorageAvailable = false;

const ensureUploadsDir = () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log(`[ProductionCases] Attempting to create uploads directory at: ${UPLOADS_DIR}`);
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    // Test if writable
    const testFile = path.join(UPLOADS_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    isLocalStorageAvailable = true;
    console.log(`[ProductionCases] Local storage is available at: ${UPLOADS_DIR}`);
  } catch (error: any) {
    console.warn(`[ProductionCases] Local storage is NOT available (this is expected on Vercel): ${error.message}`);
    isLocalStorageAvailable = false;
  }
};

// Ensure directory exists at startup
ensureUploadsDir();

// Get all production cases (Publicly accessible)
router.get('/', (async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query('SELECT * FROM production_cases ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('[ProductionCases] Error fetching cases:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Create a new case (Admin only)
router.post('/', protect as any, isAdmin as any, upload.single('cover'), (async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, youtube_url } = req.body;
    let cover_url = null;

    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;

      if (supabase) {
        const bucketName = process.env.SUPABASE_BUCKET || 'CASE-IMAGES';
        const filePath = `covers/${fileName}`;
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) {
          // Try to create bucket if it doesn't exist
          if (error.message.includes('bucket not found') || error.message.includes('Bucket not found')) {
              try {
                  await supabase.storage.createBucket(bucketName, { public: true });
                  const { data: retryData, error: retryError } = await supabase.storage
                      .from(bucketName)
                      .upload(filePath, file.buffer, {
                          contentType: file.mimetype,
                          upsert: true
                      });
                  if (retryError) throw retryError;
                  const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
                  cover_url = publicUrl;
              } catch (bucketError) {
                  console.error('[ProductionCases] Error creating bucket or retrying upload:', bucketError);
                  throw error; // Throw original error if bucket creation fails
              }
          } else {
              throw error;
          }
        } else {
          const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          cover_url = publicUrl;
        }
      } else if (isLocalStorageAvailable) {
        // Fallback to local storage
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, file.buffer);
        cover_url = `/uploads/${fileName}`;
        console.log(`[ProductionCases] File saved locally: ${cover_url}`);
      } else {
        throw new Error('Armazenamento não configurado. Por favor, configure as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY no Vercel para permitir o upload de imagens.');
      }
    }

    const { rows } = await db.query(
      'INSERT INTO production_cases (name, description, cover_url, youtube_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, cover_url, youtube_url]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('[ProductionCases] Error creating case:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Update a case (Admin only)
router.put('/:id', protect as any, isAdmin as any, upload.single('cover'), (async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, youtube_url } = req.body;
    let cover_url = req.body.cover_url;

    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;

      if (supabase) {
        const bucketName = process.env.SUPABASE_BUCKET || 'CASE-IMAGES';
        const filePath = `covers/${fileName}`;
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        cover_url = publicUrl;
      } else if (isLocalStorageAvailable) {
        // Fallback to local storage
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, file.buffer);
        cover_url = `/uploads/${fileName}`;
        console.log(`[ProductionCases] File updated locally: ${cover_url}`);
      } else {
        throw new Error('Armazenamento não configurado. Por favor, configure as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY no Vercel para permitir o upload de imagens.');
      }
    }

    const { rows } = await db.query(
      'UPDATE production_cases SET name = $1, description = $2, cover_url = $3, youtube_url = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, description, cover_url, youtube_url, id]
    );
    res.json(rows[0]);
  } catch (error: any) {
    console.error('[ProductionCases] Error updating case:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

// Delete a case (Admin only)
router.delete('/:id', protect as any, isAdmin as any, (async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM production_cases WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    console.error('[ProductionCases] Error deleting case:', error);
    res.status(500).json({ error: error.message });
  }
}) as any);

export default router;
