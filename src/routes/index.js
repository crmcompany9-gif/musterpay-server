const router = require('express').Router();
const { requireAuth, requireAdmin, login, me } = require('../auth');
const { getMyPayslips, getMyAttendance } = require('../me');

// public
router.post('/auth/login', login);

// any signed-in user
router.get('/auth/me', requireAuth, me);
router.get('/me/payslips', requireAuth, getMyPayslips);
router.get('/me/attendance', requireAuth, getMyAttendance);

// admin only (HR)
router.use('/employees', requireAuth, requireAdmin, require('./employees'));
router.use('/attendance', requireAuth, requireAdmin, require('./attendance'));
router.use('/payroll', requireAuth, requireAdmin, require('./payroll'));
router.use('/policy', requireAuth, requireAdmin, require('./policy'));

module.exports = router;