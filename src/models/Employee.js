const { Schema, model } = require('mongoose');

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    joinDate: { type: Date, default: Date.now },
    // per-employee override of the free monthly paid-leave allowance
    freePaidLeavesPerMonth: { type: Number, default: 1, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Employee', employeeSchema);
