const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// gate: require a valid Bearer token on protected routes
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const p = jwt.verify(token, SECRET);
    req.user = { id: p.sub, email: p.email, role: p.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// POST /api/auth/login  { email, password } -> { token, user }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { next(e); }
}

// GET /api/auth/me -> the signed-in user (from the token)
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { requireAuth, login, me };