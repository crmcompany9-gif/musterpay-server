const { Schema, model } = require('mongoose');

// One document per employee per day that ISN'T a plain present working day.
// (Present days can be left unstored and inferred as the default — the prototype does this.)
const STATUSES = ['present', 'absent', 'half', 'short', 'paid', 'holiday', 'off'];

const attendanceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true }, // stored at UTC midnight
    status: { type: String, enum: STATUSES, required: true },
  },
  { timestamps: true }
);

// one status per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = model('Attendance', attendanceSchema);
Attendance.STATUSES = STATUSES;
module.exports = Attendance;
