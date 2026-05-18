import { Router } from 'express';
import { queryAll, queryOne, run } from '../db.js';
import { requireAdmin, createSession, checkAdminPassword } from '../middleware.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!checkAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = createSession();
  res.json({ token });
});

router.get('/stats', requireAdmin, (_req, res) => {
  const pending = queryOne("SELECT COUNT(*) as c FROM listings WHERE status = 'pending'")?.c ?? 0;
  const approved = queryOne("SELECT COUNT(*) as c FROM listings WHERE status = 'approved'")?.c ?? 0;
  const payments = queryOne("SELECT COUNT(*) as c FROM payment_requests WHERE status = 'pending'")?.c ?? 0;
  res.json({ pending, approved, payments });
});

router.get('/listings', requireAdmin, (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT l.*, c.name_fr as category_fr
    FROM listings l
    LEFT JOIN categories c ON l.category_id = c.id
  `;
  const params = [];
  if (status) {
    sql += ' WHERE l.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY l.created_at DESC';
  res.json(queryAll(sql, params));
});

router.patch('/listings/:id', requireAdmin, (req, res) => {
  const { status, is_pinned, pinned_days } = req.body;
  const listing = queryOne('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ error: 'Not found' });

  if (status) {
    run("UPDATE listings SET status = ?, updated_at = datetime('now') WHERE id = ?", [
      status,
      req.params.id,
    ]);
  }

  if (is_pinned !== undefined) {
    let pinnedUntil = null;
    if (is_pinned) {
      const days = pinned_days || parseInt(queryOne("SELECT value FROM settings WHERE key = 'pin_days'")?.value || '30', 10);
      run(
        `UPDATE listings SET is_pinned = 1, pinned_until = datetime('now', '+' || ? || ' days'), updated_at = datetime('now') WHERE id = ?`,
        [days, req.params.id]
      );
    } else {
      run(
        "UPDATE listings SET is_pinned = 0, pinned_until = NULL, updated_at = datetime('now') WHERE id = ?",
        [req.params.id]
      );
    }
  }

  res.json(queryOne('SELECT * FROM listings WHERE id = ?', [req.params.id]));
});

router.delete('/listings/:id', requireAdmin, (req, res) => {
  run('DELETE FROM listings WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

router.get('/payments', requireAdmin, (_req, res) => {
  const rows = queryAll(
    `SELECT p.*, l.name as listing_name
     FROM payment_requests p
     LEFT JOIN listings l ON p.listing_id = l.id
     ORDER BY p.created_at DESC`
  );
  res.json(rows);
});

router.patch('/payments/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['paid', 'cancelled', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const payment = queryOne('SELECT * FROM payment_requests WHERE id = ?', [req.params.id]);
  if (!payment) return res.status(404).json({ error: 'Not found' });

  run('UPDATE payment_requests SET status = ? WHERE id = ?', [status, req.params.id]);

  if (status === 'paid' && payment.type === 'pin' && payment.listing_id) {
    const days = parseInt(queryOne("SELECT value FROM settings WHERE key = 'pin_days'")?.value || '30', 10);
    run(
      `UPDATE listings SET is_pinned = 1, pinned_until = datetime('now', '+' || ? || ' days'), updated_at = datetime('now') WHERE id = ?`,
      [days, payment.listing_id]
    );
  }

  if (status === 'paid' && payment.type === 'registration' && payment.listing_id) {
    const listing = queryOne('SELECT status FROM listings WHERE id = ?', [payment.listing_id]);
    if (listing?.status === 'pending') {
      run("UPDATE listings SET status = 'approved', updated_at = datetime('now') WHERE id = ?", [
        payment.listing_id,
      ]);
    }
  }

  res.json(queryOne('SELECT * FROM payment_requests WHERE id = ?', [req.params.id]));
});

router.get('/ads', requireAdmin, (_req, res) => {
  res.json(queryAll('SELECT * FROM ads ORDER BY sort_order, id'));
});

router.post('/ads', requireAdmin, (req, res) => {
  const { title, subtitle, whatsapp, image_url, position, active, expires_at, sort_order } = req.body;
  run(
    `INSERT INTO ads (title, subtitle, whatsapp, image_url, position, active, expires_at, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      subtitle || null,
      whatsapp || null,
      image_url || null,
      position || 'banner',
      active !== undefined ? (active ? 1 : 0) : 1,
      expires_at || null,
      sort_order ?? 0,
    ]
  );
  const ad = queryOne('SELECT * FROM ads ORDER BY id DESC LIMIT 1');
  res.status(201).json(ad);
});

router.patch('/ads/:id', requireAdmin, (req, res) => {
  const fields = ['title', 'subtitle', 'whatsapp', 'image_url', 'position', 'expires_at', 'sort_order'];
  const ad = queryOne('SELECT * FROM ads WHERE id = ?', [req.params.id]);
  if (!ad) return res.status(404).json({ error: 'Not found' });

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      run(`UPDATE ads SET ${f} = ? WHERE id = ?`, [req.body[f], req.params.id]);
    }
  }
  if (req.body.active !== undefined) {
    run('UPDATE ads SET active = ? WHERE id = ?', [req.body.active ? 1 : 0, req.params.id]);
  }

  res.json(queryOne('SELECT * FROM ads WHERE id = ?', [req.params.id]));
});

router.delete('/ads/:id', requireAdmin, (req, res) => {
  run('DELETE FROM ads WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

router.get('/settings', requireAdmin, (_req, res) => {
  res.json(queryAll('SELECT * FROM settings'));
});

router.patch('/settings', requireAdmin, (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'key required' });
  run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
  res.json(queryOne('SELECT * FROM settings WHERE key = ?', [key]));
});

export default router;
