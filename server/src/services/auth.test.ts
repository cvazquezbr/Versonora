import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createUser, findUserByEmail, comparePassword } from './auth';
import db from '../lib/db';

describe('Auth Service', () => {
  beforeAll(async () => {
    // Note: You'll need a test database configured for this to work.
    // This is a simplified example.
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        roles TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  });

  afterAll(async () => {
    await db.query('DROP TABLE IF EXISTS users');
  });

  it('should create a new user', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user = await createUser(email, password);

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.password_hash).not.toBe(password);
  });

  it('should find a user by email', async () => {
    const email = 'test2@example.com';
    const password = 'password123';
    await createUser(email, password);

    const user = await findUserByEmail(email);
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });

  it('should compare passwords correctly', async () => {
    const email = 'test3@example.com';
    const password = 'password123';
    const user = await createUser(email, password);

    const isMatch = await comparePassword(password, user.password_hash);
    expect(isMatch).toBe(true);
  });
});
