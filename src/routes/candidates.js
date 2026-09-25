const r = require('express').Router();
const c = require('../controllers/candidates');
r.get('/', c.list);
r.post('/', c.create);
r.patch('/:id', c.update);
r.delete('/:id', c.remove);
r.post('/:id/accept', c.accept);
r.post('/:id/reject', c.reject);
module.exports = r;