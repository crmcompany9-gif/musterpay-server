const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// any signed-in user
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const p = jwt.verify(token, SECRET);
    req.user = { id: p.sub, email: p.email, role: p.role, name: p.name, employeeId: p.employeeId || null };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// admin only — HR routes
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const payload = {
      sub: String(user._id), email: user.email, role: user.role, name: user.name,
      employeeId: user.employeeId ? String(user.employeeId) : null,
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role, employeeId: user.employeeId } });
  } catch (e) { next(e); }
}

function me(req, res) { res.json({ user: req.user }); }

module.exports = { requireAuth, requireAdmin, login, me };