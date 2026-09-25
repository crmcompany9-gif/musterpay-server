const Candidate = require('../models/Candidate');
const Employee = require('../models/Employee');

exports.list = async (req, res, next) => {
  try { res.json(await Candidate.find().sort({ createdAt: -1 })); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, role, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const c = await Candidate.create({ name: name.trim(), email, role, notes });
    res.status(201).json(c);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    // editable fields; status here may only move within the pipeline (not to accepted/rejected)
    const allowed = ['name', 'email', 'role', 'notes', 'interviewDate', 'interviewer', 'score', 'status'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (patch.status && !['applied', 'interviewing'].includes(patch.status)) {
      return res.status(400).json({ error: 'Use accept or reject to change to that status' });
    }
    const c = await Candidate.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ error: 'Candidate not found' });
    res.json(c);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const c = await Candidate.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ deleted: true, id: c._id });
  } catch (e) { next(e); }
};

// POST /api/candidates/:id/accept  { offeredSalary, startDate }
exports.accept = async (req, res, next) => {
  try {
    const c = await Candidate.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Candidate not found' });
    if (c.linkedEmployeeId) return res.status(409).json({ error: 'Already accepted and added to the roster' });

    const offeredSalary = Number(req.body.offeredSalary);
    const startDate = req.body.startDate;
    if (!offeredSalary || offeredSalary <= 0) return res.status(400).json({ error: 'A valid offered salary is required' });
    if (!startDate) return res.status(400).json({ error: 'A start date is required' });

    const employee = await Employee.create({
      name: c.name,
      monthlySalary: offeredSalary,
      joinDate: new Date(startDate),
    });

    c.status = 'accepted';
    c.offeredSalary = offeredSalary;
    c.startDate = new Date(startDate);
    c.linkedEmployeeId = employee._id;
    await c.save();

    res.json({ candidate: c, employee });
  } catch (e) { next(e); }
};

// POST /api/candidates/:id/reject  { reason }
exports.reject = async (req, res, next) => {
  try {
    const c = await Candidate.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Candidate not found' });
    if (c.linkedEmployeeId) return res.status(409).json({ error: 'Already accepted; cannot reject' });
    c.status = 'rejected';
    c.rejectionReason = req.body.reason || '';
    await c.save();
    res.json(c);
  } catch (e) { next(e); }
};