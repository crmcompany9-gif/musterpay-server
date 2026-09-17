require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

async function main() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';
  const name = process.argv[4] || 'Admin';
  if (!email || !password) {
    console.error('Usage: node src/createAdmin.js <email> <password> [name]');
    process.exit(1);
  }
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash, name, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready: ${user.email}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });