const { Schema, model } = require('mongoose');

// A frozen result of a payroll run. Once finalized, past payslips don't change
// even if policy or salary changes later.
const payslipSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    grossSalary: Number,
    perDay: Number,
    counts: { type: Object }, // { present, absent, half, short, paid, holiday, off }
    lopDays: Number,
    deduction: Number,
    netPayable: Number,
    finalizedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

payslipSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

module.exports = model('Payslip', payslipSchema);
