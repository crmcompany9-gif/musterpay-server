const r = require('express').Router();
const c = require('../controllers/policy');
r.get('/', c.get);
r.patch('/', c.update);
module.exports = r;
