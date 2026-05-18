import { queryOne } from './db.js';

const sessions = new Map();

export function createSession() {
  const token = crypto.randomUUID();
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export function checkAdminPassword(password) {
  const row = queryOne("SELECT value FROM settings WHERE key = 'admin_password'");
  return row && row.value === password;
}
