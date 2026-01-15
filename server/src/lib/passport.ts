import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db';
import { createUser, findUserByGoogleId } from '../services/auth';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findUserByGoogleId(profile.id);
        if (!user) {
          user = await createUser(profile.emails![0].value, undefined, profile.id);
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    // This is a placeholder. You'd typically fetch the user from the DB by ID.
    // For this example, we'll just pass the user object along.
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error);
  }
});

export default passport;
