const { Schema, model } = require('mongoose');

const STATUSES = ['applied', 'interviewing', 'accepted', 'rejected'];

const candidateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, trim: true },              // position applied for
    status: { type: String, enum: STATUSES, default: 'applied' },
    interviewDate: { type: Date, default: null },
    interviewer: { type: String, default: '' },       // who interviews
    score: { type: Number, default: null },           // rating out of 10, set after interview
    notes: { type: String, default: '' },
    offeredSalary: { type: Number, default: null },  // set on accept
    startDate: { type: Date, default: null },         // set on accept
    rejectionReason: { type: String, default: '' },   // set on reject
    linkedEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null }, // set on accept
  },
  { timestamps: true }
);

const Candidate = model('Candidate', candidateSchema);
Candidate.STATUSES = STATUSES;
module.exports = Candidate;