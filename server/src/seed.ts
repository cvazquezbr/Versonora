import dotenv from 'dotenv';
import { createUser } from './services/auth';

dotenv.config();

const createAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file');
    process.exit(1);
  }

  try {
    console.log(`Creating admin user with email: ${adminEmail}`);
    await createUser(adminEmail, adminPassword, undefined, ['admin']);
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
