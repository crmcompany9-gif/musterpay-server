const { Schema, model } = require('mongoose');

const payslipSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    grossSalary: Number,
    perDay: Number,
    counts: { type: Object },
    preJoinDays: { type: Number, default: 0 },
    lopDays: Number,
    unpaidDays: Number,
    deduction: Number,
    netPayable: Number,
    finalizedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

payslipSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });

module.exports = model('Payslip', payslipSchema);