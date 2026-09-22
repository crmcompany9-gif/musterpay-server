const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const Attendance = require('./models/Attendance');

// GET /api/me/payslips  -> { employee, payslips } for the signed-in employee only.
async function getMyPayslips(req, res, next) {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(403).json({ error: 'This area is for employee accounts.' });
    const employee = await Employee.findById(employeeId).lean();
    const payslips = await Payslip.find({ employeeId }).sort({ year: -1, month: -1 }).lean();
    res.json({
      employee: employee ? { id: employee._id, name: employee.name } : { id: employeeId, name: req.user.name || 'You' },
      payslips,
    });
  } catch (e) { next(e); }
}

// GET /api/me/attendance?year=&month=  -> the signed-in employee's own marks for that month.
// Isolation: queries by req.user.employeeId (from the token) + the month range only.
async function getMyAttendance(req, res, next) {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(403).json({ error: 'This area is for employee accounts.' });
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const records = await Attendance.find({ employeeId, date: { $gte: start, $lt: end } }).sort({ date: 1 }).lean();
    res.json({ year, month, records });
  } catch (e) { next(e); }
}

module.exports = { getMyPayslips, getMyAttendance };