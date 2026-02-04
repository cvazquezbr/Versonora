import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../lib/db.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const createUser = async (email: string, password?: string, googleId?: string, roles: string[] = []) => {
  if (!password && !googleId) {
    throw new Error('Password or Google ID is required');
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const { rows } = await db.query(
    'INSERT INTO users (email, password_hash, google_id, roles) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, passwordHash, googleId, roles]
  );

  return rows[0];
};

export const findUserByEmail = async (email: string) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const findUserByGoogleId = async (googleId: string) => {
  const { rows } = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0];
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, roles: string[]) => {
  return jwt.sign({ userId, roles }, JWT_SECRET, { expiresIn: '1h' });
};

export const generatePasswordResetToken = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await db.query(
    'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
    [resetToken, expires, user.id]
  );

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  console.log(`Password reset link for ${email}: ${resetLink}`);

  return resetToken;
};

export const resetPassword = async (token: string, password: string) => {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);

  if (!user.rows[0] || user.rows[0].reset_password_token !== token || user.rows[0].reset_password_expires < new Date()) {
    throw new Error('Invalid or expired password reset token');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.query(
    'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
    [passwordHash, decoded.userId]
  );
};
