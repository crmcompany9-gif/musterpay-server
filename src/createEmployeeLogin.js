require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Employee = require('./models/Employee');
const User = require('./models/User');

async function main() {
  const name = process.argv[2];
  const email = (process.argv[3] || '').toLowerCase().trim();
  const password = process.argv[4] || '';
  if (!name || !email || !password) {
    console.error('Usage: node src/createEmployeeLogin.js "<employee name>" <email> <password>');
    process.exit(1);
  }
  await connectDB();
  const matches = await Employee.find({ name });
  if (matches.length === 0) {
    console.error(`No employee named "${name}". Check the exact spelling in the roster.`);
    await mongoose.disconnect(); process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`More than one employee named "${name}". Give them distinct names first.`);
    await mongoose.disconnect(); process.exit(1);
  }
  const employee = matches[0];
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash, name: employee.name, role: 'employee', employeeId: employee._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Employee login ready: ${user.email}  ->  ${employee.name}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });