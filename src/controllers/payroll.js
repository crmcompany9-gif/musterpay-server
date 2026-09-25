const { runPayroll } = require('../services/payroll');
const Payslip = require('../models/Payslip');

// GET /api/payroll/run?year=&month=
exports.run = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ error: 'year and month (1-12) are required' });
    res.json(await runPayroll(year, month));
  } catch (e) { next(e); }
};

// POST /api/payroll/finalize?year=&month=
exports.finalize = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const result = await runPayroll(year, month);

    const ops = result.rows.map((r) => ({
      updateOne: {
        filter: { employeeId: r.employeeId, year, month },
        update: {
          $set: {
            employeeId: r.employeeId, year, month,
            grossSalary: r.grossSalary, perDay: r.perDay, counts: r.counts,
            preJoinDays: r.preJoinDays, lopDays: r.lopDays, unpaidDays: r.unpaidDays,
            deduction: r.deduction, netPayable: r.netPayable,
            finalizedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));
    if (ops.length) await Payslip.bulkWrite(ops);
    res.json({ finalized: ops.length, period: { year, month }, totals: result.totals });
  } catch (e) { next(e); }
};