const r = require('express').Router();
const c = require('../controllers/employees');
r.get('/', c.list);
r.post('/', c.create);
r.patch('/:id', c.update);
r.delete('/:id', c.remove);
r.post('/:id/login', c.createLogin);
module.exports = r;