// Company-wide payroll policy. Env can override; sensible defaults match the prototype.
module.exports = {
  PER_DAY_METHOD: process.env.PER_DAY_METHOD || 'calendar', // 'calendar' (÷ actual days) | 'fixed30' (÷ 30)
  SHORT_LEAVE_FRACTION: Number(process.env.SHORT_LEAVE_FRACTION || 0.25),
  FREE_PAID_LEAVES_PER_MONTH: Number(process.env.FREE_PAID_LEAVES_PER_MONTH || 1),
};
