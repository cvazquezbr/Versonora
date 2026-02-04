import { Router } from 'express';
import passport from 'passport';
import {
  createUser,
  findUserByEmail,
  comparePassword,
  generateToken,
  generatePasswordResetToken,
  resetPassword,
} from '../services/auth.js';

const router = Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await createUser(email, password);
    const token = generateToken(user.id, user.roles);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !user.password_hash || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id, user.roles);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id, user.roles);
    res.redirect(`/?token=${token}`);
  }
);

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    await generatePasswordResetToken(email);
    res.json({ message: 'Password reset link sent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);
    res.json({ message: 'Password has been reset' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
