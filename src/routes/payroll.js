const r = require('express').Router();
const c = require('../controllers/payroll');
r.get('/run', c.run);
r.post('/finalize', c.finalize);
module.exports = r;
