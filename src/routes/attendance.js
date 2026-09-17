const r = require('express').Router();
const c = require('../controllers/attendance');
r.get('/', c.listByMonth);
r.put('/', c.mark);
module.exports = r;
