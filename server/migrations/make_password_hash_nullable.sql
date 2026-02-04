-- Migration to make password_hash nullable to support Google OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
