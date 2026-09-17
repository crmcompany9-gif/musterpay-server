const Attendance = require('../models/Attendance');
const { STATUSES } = Attendance;

// PUT /api/attendance   body: { employeeId, year, month, day, status }
// status 'present' clears the record (present is the inferred default).
exports.mark = async (req, res, next) => {
  try {
    const { employeeId, year, month, day, status } = req.body;
    if (!STATUSES.includes(status))
      return res.status(400).json({ error: `Invalid status. One of: ${STATUSES.join(', ')}` });

    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    if (status === 'present') {
      await Attendance.deleteOne({ employeeId, date });
      return res.json({ cleared: true, employeeId, date });
    }
    const rec = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { employeeId, date, status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(rec);
  } catch (e) { next(e); }
};

// GET /api/attendance?year=&month=
exports.listByMonth = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const recs = await Attendance.find({ date: { $gte: start, $lt: end } }).sort({ date: 1 });
    res.json(recs);
  } catch (e) { next(e); }
};
