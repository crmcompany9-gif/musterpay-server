const { Schema, model } = require('mongoose');

// A single company-wide settings document (key: 'default').
// These deduction weights and the free-leave allowance drive every payroll run.
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    absentWeight: { type: Number, default: 1, min: 0 },      // an absent day = this many days deducted
    halfWeight: { type: Number, default: 0.5, min: 0 },      // a half day
    shortWeight: { type: Number, default: 0.25, min: 0 },    // a short leave / late arrival
    freePaidLeavesPerMonth: { type: Number, default: 1, min: 0 },
    perDayMethod: { type: String, enum: ['calendar', 'fixed30'], default: 'calendar' },
  },
  { timestamps: true }
);

module.exports = model('Settings', settingsSchema);
