const { Schema, model } = require('mongoose');

// Company-declared holidays. Applied to everyone unless an employee has an
// explicit attendance record that day (e.g. they worked it).
const holidaySchema = new Schema(
  {
    date: { type: Date, required: true, unique: true }, // UTC midnight
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = model('Holiday', holidaySchema);
