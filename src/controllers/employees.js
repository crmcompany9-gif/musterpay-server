const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.list = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ name: 1 }).lean();
    // annotate each with whether a login exists (so the UI can show status)
    const linked = await User.find({ role: 'employee' }).select('employeeId email').lean();
    const byEmp = {};
    for (const u of linked) if (u.employeeId) byEmp[String(u.employeeId)] = u.email;
    res.json(employees.map((e) => ({ ...e, loginEmail: byEmp[String(e._id)] || null })));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, monthlySalary, joinDate, freePaidLeavesPerMonth } = req.body;
    const emp = await Employee.create({ name, monthlySalary, joinDate, freePaidLeavesPerMonth });
    res.status(201).json(emp);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    await Attendance.deleteMany({ employeeId: emp._id });
    await User.deleteMany({ employeeId: emp._id }); // remove their login too
    res.json({ deleted: true, id: emp._id });
  } catch (e) { next(e); }
};

// POST /api/employees/:id/login  { email, password }
// Creates (or resets) the employee's login and links it to this record. Admin only.
exports.createLogin = async (req, res, next) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const email = String(req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    // don't let one email be reused for a different person
    const existing = await User.findOne({ email });
    if (existing && String(existing.employeeId || '') !== String(emp._id)) {
      return res.status(409).json({ error: 'That email is already used by another account' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { email, passwordHash, name: emp.name, role: 'employee', employeeId: emp._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true, employeeId: emp._id, loginEmail: user.email });
  } catch (e) { next(e); }
};