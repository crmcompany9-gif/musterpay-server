const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const { getPolicy } = require('./policy');

const round2 = (n) => Math.round(n * 100) / 100;
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const isSundayUTC = (year, month, day) => new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;

function perDayRate(salary, year, month, method) {
  if (method === 'fixed30') return salary / 30;
  const d = daysInMonth(year, month);
  return d > 0 ? salary / d : 0;
}

function computeEmployeePayroll({ employee, year, month, attendanceRecords = [], holidayDates = [], policy }) {
  const nDays = daysInMonth(year, month);
  const perDay = perDayRate(employee.monthlySalary, year, month, policy.perDayMethod);
  const allowance =
    employee.freePaidLeavesPerMonth != null ? employee.freePaidLeavesPerMonth : policy.freePaidLeavesPerMonth;
  const wA = policy.absentWeight, wH = policy.halfWeight, wS = policy.shortWeight;

  let preJoinCutoff = 0;
  const jd = employee.joinDate ? new Date(employee.joinDate) : null;
  if (jd && !isNaN(jd.getTime())) {
    const jy = jd.getUTCFullYear(), jm = jd.getUTCMonth() + 1, jday = jd.getUTCDate();
    if (jy > year || (jy === year && jm > month)) preJoinCutoff = nDays;
    else if (jy === year && jm === month) preJoinCutoff = jday - 1;
  }

  const attByDay = {};
  for (const r of attendanceRecords) attByDay[new Date(r.date).getUTCDate()] = r.status;
  const holidaySet = new Set(holidayDates.map((d) => new Date(d).getUTCDate()));

  const counts = { present: 0, absent: 0, half: 0, short: 0, paid: 0, holiday: 0, off: 0 };
  let preJoinDays = 0;
  for (let day = 1; day <= nDays; day++) {
    if (day <= preJoinCutoff) { preJoinDays++; continue; }
    let status;
    if (attByDay[day]) status = attByDay[day];
    else if (holidaySet.has(day)) status = 'holiday';
    else if (isSundayUTC(year, month, day)) status = 'off';
    else status = 'present';
    counts[status]++;
  }

  const coveredPaid = Math.min(allowance, counts.paid);
  const excessPaid = counts.paid - coveredPaid;
  const grossLop = counts.absent * wA + counts.half * wH + counts.short * wS;
  const lopDays = round2(grossLop + excessPaid * 1);
  const unpaidDays = round2(lopDays + preJoinDays);
  const preJoinDeduction = round2(preJoinDays * perDay);
  const deduction = round2(unpaidDays * perDay);
  const netPayable = round2(employee.monthlySalary - deduction);

  const breakdown = {
    preJoin: preJoinDeduction,
    absent: round2(counts.absent * wA * perDay),
    half: round2(counts.half * wH * perDay),
    short: round2(counts.short * wS * perDay),
    excessPaid: round2(excessPaid * perDay),
  };

  return {
    employeeId: employee._id, name: employee.name, grossSalary: employee.monthlySalary,
    joinDate: employee.joinDate || null,
    perDay: round2(perDay), counts, coveredPaid, excessPaid,
    preJoinDays, preJoinDeduction, lopDays, unpaidDays, deduction, netPayable, breakdown,
  };
}

async function runPayroll(year, month) {
  const p = await getPolicy();
  const policy = {
    absentWeight: p.absentWeight, halfWeight: p.halfWeight, shortWeight: p.shortWeight,
    freePaidLeavesPerMonth: p.freePaidLeavesPerMonth, perDayMethod: p.perDayMethod,
  };

  const employees = await Employee.find({ active: true }).sort({ name: 1 }).lean();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const [attendance, holidays] = await Promise.all([
    Attendance.find({ date: { $gte: start, $lt: end } }).lean(),
    Holiday.find({ date: { $gte: start, $lt: end } }).lean(),
  ]);

  const byEmp = {};
  for (const a of attendance) {
    const k = String(a.employeeId);
    if (!byEmp[k]) byEmp[k] = [];
    byEmp[k].push(a);
  }
  const holidayDates = holidays.map((h) => h.date);

  const rows = employees.map((emp) =>
    computeEmployeePayroll({
      employee: emp, year, month, attendanceRecords: byEmp[String(emp._id)] || [], holidayDates, policy,
    })
  );

  const totals = rows.reduce(
    (t, r) => ({
      employees: t.employees + 1,
      grossSalary: round2(t.grossSalary + r.grossSalary),
      lopDays: round2(t.lopDays + r.lopDays),
      preJoinDays: round2(t.preJoinDays + r.preJoinDays),
      unpaidDays: round2(t.unpaidDays + r.unpaidDays),
      deduction: round2(t.deduction + r.deduction),
      netPayable: round2(t.netPayable + r.netPayable),
    }),
    { employees: 0, grossSalary: 0, lopDays: 0, preJoinDays: 0, unpaidDays: 0, deduction: 0, netPayable: 0 }
  );

  return { period: { year, month }, daysInMonth: daysInMonth(year, month), rows, totals, policy };
}

module.exports = { computeEmployeePayroll, runPayroll, perDayRate, daysInMonth, round2 };