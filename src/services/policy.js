const Settings = require('../models/Settings');
const env = require('../config/policy');

async function getPolicy() {
  let s = await Settings.findOne({ key: 'default' });
  if (!s) {
    s = await Settings.create({
      key: 'default',
      absentWeight: 1,
      halfWeight: 0.5,
      shortWeight: env.SHORT_LEAVE_FRACTION,
      freePaidLeavesPerMonth: env.FREE_PAID_LEAVES_PER_MONTH,
      perDayMethod: env.PER_DAY_METHOD,
    });
  }
  return s;
}

async function updatePolicy(patch) {
  const allowed = ['absentWeight', 'halfWeight', 'shortWeight', 'freePaidLeavesPerMonth', 'perDayMethod'];
  const clean = {};
  for (const k of allowed) if (patch[k] != null) clean[k] = patch[k];
  return Settings.findOneAndUpdate(
    { key: 'default' },
    { $set: clean },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
}

module.exports = { getPolicy, updatePolicy };
