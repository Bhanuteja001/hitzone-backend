import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hitzone-backend';

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const email = 'dineshmodem5132@gmail.com';
  
  // Check if admin already exists
  const existing = await mongoose.connection.db.collection('users').findOne({ email });
  if (existing) {
    console.log('Admin user with email dineshmodem5132@gmail.com already exists.');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('adminpassword', 10);
  const adminUser = {
    name: 'Default Admin',
    email: email,
    password: hashedPassword,
    phone: 1234567890,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await mongoose.connection.db.collection('users').insertOne(adminUser);
  console.log('Admin user seeded successfully!');
  console.log('Credentials:');
  console.log(`Email/Username: ${email}`);
  console.log('Password: adminpassword');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
