const router = require('express').Router();
const { requireAuth, login, me } = require('../auth');

// public
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, me);

// protected
router.use('/employees', requireAuth, require('./employees'));
router.use('/attendance', requireAuth, require('./attendance'));
router.use('/payroll', requireAuth, require('./payroll'));
router.use('/policy', requireAuth, require('./policy'));

module.exports = router;