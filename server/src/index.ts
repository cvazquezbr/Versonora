import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

async function startServer() {
  const server = createServer(app);
  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
