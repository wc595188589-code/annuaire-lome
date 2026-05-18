import { Router } from 'express';
import { queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/settings', (_req, res) => {
  const rows = queryAll('SELECT key, value FROM settings WHERE key LIKE ?', ['%_fee_%']);
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const pinDays = queryOne("SELECT value FROM settings WHERE key = 'pin_days'");
  settings.pin_days = pinDays?.value ?? '30';
  res.json(settings);
});

router.get('/categories', (_req, res) => {
  const categories = queryAll(
    'SELECT * FROM categories ORDER BY sort_order, name_fr'
  );
  res.json(categories);
});

router.get('/listings', (req, res) => {
  const { q, category, type, quartier } = req.query;
  let sql = `
    SELECT l.*, c.slug as category_slug, c.name_fr as category_fr, c.name_en as category_en, c.icon
    FROM listings l
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE l.status = 'approved'
  `;
  const params = [];

  if (type) {
    sql += ' AND l.type = ?';
    params.push(type);
  }
  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (quartier) {
    sql += ' AND l.quartier LIKE ?';
    params.push(`%${quartier}%`);
  }
  if (q) {
    sql += ' AND (l.name LIKE ? OR l.description LIKE ? OR l.quartier LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY l.is_pinned DESC,
    CASE WHEN l.pinned_until IS NOT NULL AND l.pinned_until > datetime('now') THEN 0 ELSE 1 END,
    l.updated_at DESC`;

  const listings = queryAll(sql, params);
  res.json(listings);
});

router.get('/listings/:id', (req, res) => {
  const listing = queryOne(
    `SELECT l.*, c.slug as category_slug, c.name_fr as category_fr, c.name_en as category_en, c.icon
     FROM listings l
     LEFT JOIN categories c ON l.category_id = c.id
     WHERE l.id = ? AND l.status = 'approved'`,
    [req.params.id]
  );
  if (!listing) return res.status(404).json({ error: 'Not found' });
  res.json(listing);
});

router.get('/ads', (_req, res) => {
  const ads = queryAll(
    `SELECT * FROM ads
     WHERE active = 1
       AND (expires_at IS NULL OR expires_at > datetime('now'))
     ORDER BY sort_order, id`
  );
  res.json(ads);
});

router.post('/listings', (req, res) => {
  const { type, name, description, category_id, phone, whatsapp, address, quartier, request_pin } = req.body;

  if (!type || !['business', 'craftsman'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (!name?.trim() || !whatsapp?.trim()) {
    return res.status(400).json({ error: 'Name and WhatsApp required' });
  }

  run(
    `INSERT INTO listings (type, name, description, category_id, phone, whatsapp, address, quartier, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      type,
      name.trim(),
      description?.trim() || null,
      category_id || null,
      phone?.trim() || null,
      whatsapp.trim(),
      address?.trim() || null,
      quartier?.trim() || null,
    ]
  );

  const listing = queryOne('SELECT * FROM listings ORDER BY id DESC LIMIT 1');
  const regFee = queryOne("SELECT value FROM settings WHERE key = 'registration_fee_fcfa'");

  run(
    `INSERT INTO payment_requests (listing_id, type, amount_fcfa, contact_name, contact_phone, notes)
     VALUES (?, 'registration', ?, ?, ?, ?)`,
    [
      listing.id,
      parseInt(regFee?.value || '5000', 10),
      name.trim(),
      phone?.trim() || whatsapp.trim(),
      `Inscription ${type}`,
    ]
  );

  if (request_pin) {
    const pinFee = queryOne("SELECT value FROM settings WHERE key = 'pin_fee_fcfa'");
    run(
      `INSERT INTO payment_requests (listing_id, type, amount_fcfa, contact_name, contact_phone, notes)
       VALUES (?, 'pin', ?, ?, ?, 'Demande mise en avant')`,
      [
        listing.id,
        parseInt(pinFee?.value || '10000', 10),
        name.trim(),
        phone?.trim() || whatsapp.trim(),
      ]
    );
  }

  res.status(201).json({
    listing,
    message: 'pending_review',
    payment: {
      registration_fcfa: parseInt(regFee?.value || '5000', 10),
      pin_requested: !!request_pin,
    },
  });
});

router.post('/payments/pin', (req, res) => {
  const { listing_id, contact_name, contact_phone } = req.body;
  if (!listing_id) return res.status(400).json({ error: 'listing_id required' });

  const listing = queryOne('SELECT * FROM listings WHERE id = ?', [listing_id]);
  if (!listing) return res.status(404).json({ error: 'Not found' });

  const pinFee = queryOne("SELECT value FROM settings WHERE key = 'pin_fee_fcfa'");
  run(
    `INSERT INTO payment_requests (listing_id, type, amount_fcfa, contact_name, contact_phone, notes)
     VALUES (?, 'pin', ?, ?, ?, 'Renouvellement mise en avant')`,
    [
      listing_id,
      parseInt(pinFee?.value || '10000', 10),
      contact_name || listing.name,
      contact_phone || listing.phone || listing.whatsapp,
    ]
  );

  res.status(201).json({
    amount_fcfa: parseInt(pinFee?.value || '10000', 10),
    message: 'pay_cash_at_office',
  });
});

router.post('/payments/ad', (req, res) => {
  const { title, contact_name, contact_phone, notes } = req.body;
  if (!contact_phone) return res.status(400).json({ error: 'contact_phone required' });

  run(
    `INSERT INTO payment_requests (listing_id, type, amount_fcfa, contact_name, contact_phone, notes, status)
     VALUES (NULL, 'ad', 25000, ?, ?, ?, 'pending')`,
    [contact_name || 'Annonceur', contact_phone, notes || title || 'Demande bannière pub']
  );

  res.status(201).json({ amount_fcfa: 25000, message: 'pay_cash_at_office' });
});

export default router;
