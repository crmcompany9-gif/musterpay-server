const { Schema, model } = require('mongoose');

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    // no default: a manually-added employee is treated as already employed (full month)
    // unless a join date is set explicitly (mid-month joiner → pro-rated first month)
    joinDate: { type: Date, default: null },
    freePaidLeavesPerMonth: { type: Number, default: 1, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Employee', employeeSchema);