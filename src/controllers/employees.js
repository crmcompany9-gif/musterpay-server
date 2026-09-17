const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

exports.list = async (req, res, next) => {
  try { res.json(await Employee.find().sort({ name: 1 })); } catch (e) { next(e); }
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
    res.json({ deleted: true, id: emp._id });
  } catch (e) { next(e); }
};
