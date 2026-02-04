import cors from 'cors';
import express from 'express';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import passport from './lib/passport';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

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
