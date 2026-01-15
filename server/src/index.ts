import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import passport from './lib/passport';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(cors());
  app.use(bodyParser.json());
  app.use(passport.initialize());

  app.use('/api/admin', adminRoutes);
  app.use('/api/auth', authRoutes);

  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.resolve(__dirname, '..', 'public');
    app.use(express.static(staticPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(staticPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
