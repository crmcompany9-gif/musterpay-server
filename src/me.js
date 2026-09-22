const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');

// GET /api/me/payslips  -> { employee, payslips } for the signed-in employee only.
// Isolation is enforced here: it queries by req.user.employeeId (from the token),
// never by a client-supplied id, so an employee can never fetch someone else's.
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

module.exports = { getMyPayslips };