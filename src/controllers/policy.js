const { getPolicy, updatePolicy } = require('../services/policy');

exports.get = async (req, res, next) => {
  try { res.json(await getPolicy()); } catch (e) { next(e); }
};

// PATCH /api/policy  { absentWeight?, halfWeight?, shortWeight?, freePaidLeavesPerMonth?, perDayMethod? }
exports.update = async (req, res, next) => {
  try { res.json(await updatePolicy(req.body)); } catch (e) { next(e); }
};
