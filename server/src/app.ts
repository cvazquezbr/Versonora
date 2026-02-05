import cors from 'cors';
import express from 'express';
import { initSchema } from './lib/schema.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import productionCasesRoutes from './routes/production-cases.js';
import passport from './lib/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize database schema
initSchema().catch(err => {
  console.error('Failed to initialize database schema:', err);
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/production-cases', productionCasesRoutes);

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.resolve(__dirname, '..', 'public');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    // Check if it's an API route that should have been handled above
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
}

export default app;
