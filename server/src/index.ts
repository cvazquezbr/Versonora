import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';

async function startServer() {
  const server = createServer(app);
  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
