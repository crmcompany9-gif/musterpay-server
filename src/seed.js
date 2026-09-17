require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Holiday = require('./models/Holiday');
const Payslip = require('./models/Payslip');
const { runPayroll } = require('./services/payroll');

const YEAR = 2026;
const MONTH = 9; // September 2026 — same as the prototype

const EMPLOYEES = [
  { name: 'Ravi Kumar', monthlySalary: 10000 },
  { name: 'Priya Shah', monthlySalary: 18000 },
  { name: 'Amit Verma', monthlySalary: 12000 },
  { name: 'Sneha Reddy', monthlySalary: 15000 },
  { name: 'Arjun Nair', monthlySalary: 22000 },
  { name: 'Neha Gupta', monthlySalary: 13500 },
  { name: 'Vikram Singh', monthlySalary: 16000 },
  { name: 'Pooja Iyer', monthlySalary: 11000 },
];

// exceptions only — everything else defaults to present (or Sunday = off)
const MARKS = {
  'Ravi Kumar': { 3: 'absent', 10: 'half', 17: 'short', 24: 'paid' },
  'Amit Verma': { 5: 'absent', 12: 'absent', 19: 'absent', 26: 'half' },
  'Sneha Reddy': { 8: 'short', 22: 'short' },
  'Arjun Nair': { 15: 'paid' },
  'Neha Gupta': { 9: 'half', 18: 'half' },
  'Pooja Iyer': { 4: 'absent', 11: 'absent' },
};

async function main() {
  await connectDB();
  await Promise.all([
    Employee.deleteMany({}), Attendance.deleteMany({}),
    Holiday.deleteMany({}), Payslip.deleteMany({}),
  ]);

  const created = await Employee.insertMany(EMPLOYEES);
  const byName = {};
  created.forEach((e) => (byName[e.name] = e));

  const attDocs = [];
  for (const [name, days] of Object.entries(MARKS)) {
    const emp = byName[name];
    for (const [day, status] of Object.entries(days)) {
      attDocs.push({
        employeeId: emp._id,
        date: new Date(Date.UTC(YEAR, MONTH - 1, Number(day))),
        status,
      });
    }
  }
  await Attendance.insertMany(attDocs);
  console.log(`Seeded ${created.length} employees, ${attDocs.length} attendance records for ${MONTH}/${YEAR}.\n`);

  const run = await runPayroll(YEAR, MONTH);
  console.table(
    run.rows.map((r) => ({
      Employee: r.name, Gross: r.grossSalary, 'LOP days': r.lopDays,
      Deduction: r.deduction, 'Net payable': r.netPayable,
    }))
  );
  console.log(
    `\nCompany payout: ${run.totals.netPayable}  ` +
    `(gross ${run.totals.grossSalary} − deductions ${run.totals.deduction}, ${run.totals.employees} employees)`
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
