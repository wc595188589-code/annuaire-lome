import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'annuaire.db');

let db = null;
let saveTimer = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!db) return;
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }, 300);
}

export function persistNow() {
  if (!db) return;
  const data = db.export();
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const wasmPath = path.join(
    process.cwd(),
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm'
  );

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  createSchema();
  seedIfEmpty();
  persistNow();
  return db;
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      icon TEXT DEFAULT '📍',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('business', 'craftsman')),
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id),
      phone TEXT,
      whatsapp TEXT NOT NULL,
      address TEXT,
      quartier TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      is_pinned INTEGER NOT NULL DEFAULT 0,
      pinned_until TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      whatsapp TEXT,
      image_url TEXT,
      position TEXT NOT NULL DEFAULT 'banner' CHECK(position IN ('banner', 'sidebar', 'footer')),
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payment_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER REFERENCES listings(id),
      type TEXT NOT NULL CHECK(type IN ('registration', 'pin', 'ad')),
      amount_fcfa INTEGER NOT NULL,
      contact_name TEXT,
      contact_phone TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedIfEmpty() {
  const row = db.exec('SELECT COUNT(*) as c FROM categories');
  const count = row[0]?.values[0][0] ?? 0;
  if (count > 0) return;

  const categories = [
    ['restaurants', 'Restaurants', 'Restaurants', '🍽️', 1],
    ['coiffure', 'Coiffure & beauté', 'Hair & beauty', '💇', 2],
    ['plomberie', 'Plomberie', 'Plumbing', '🔧', 3],
    ['electricite', 'Électricité', 'Electrical', '⚡', 4],
    ['transport', 'Transport & taxi', 'Transport & taxi', '🚕', 5],
    ['sante', 'Santé & pharmacie', 'Health & pharmacy', '💊', 6],
    ['vetements', 'Vêtements & mode', 'Clothing & fashion', '👗', 7],
    ['electronique', 'Téléphone & électronique', 'Phones & electronics', '📱', 8],
    ['construction', 'Construction & maçonnerie', 'Construction', '🏗️', 9],
    ['menage', 'Ménage & nettoyage', 'Cleaning', '🧹', 10],
  ];

  for (const c of categories) {
    db.run(
      'INSERT INTO categories (slug, name_fr, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
      c
    );
  }

  db.run(`INSERT INTO settings (key, value) VALUES ('registration_fee_fcfa', '5000')`);
  db.run(`INSERT INTO settings (key, value) VALUES ('pin_fee_fcfa', '10000')`);
  db.run(`INSERT INTO settings (key, value) VALUES ('pin_days', '30')`);
  db.run(`INSERT INTO settings (key, value) VALUES ('admin_password', 'lome2026')`);

  const sampleListings = [
    ['business', 'Restaurant Chez Afi', 'Cuisine togolaise et grillades au port de Lomé.', 1, '+22890123456', '+22890123456', 'Boulevard du Mono', 'Port', 'approved', 1],
    ['craftsman', 'Koffi Plomberie', 'Réparation fuites, installation chauffe-eau, dépannage 24h.', 3, '+22890765432', '+22890765432', 'Adidogomé', 'Adidogomé', 'approved', 0],
    ['business', 'Boutique Mode Lomé', 'Vêtements africains et accessoires.', 7, '+22891234567', '+22891234567', 'Grand Marché', 'Centre', 'approved', 0],
  ];

  for (const l of sampleListings) {
    db.run(
      `INSERT INTO listings (type, name, description, category_id, phone, whatsapp, address, quartier, status, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      l
    );
  }

  db.run(
    `INSERT INTO ads (title, subtitle, whatsapp, position, active, sort_order)
     VALUES (?, ?, ?, 'banner', 1, 1)`,
    ['Espace publicitaire', 'Contactez-nous sur WhatsApp', '+22890000000']
  );

  scheduleSave();
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function run(sql, params = []) {
  getDb().run(sql, params);
  scheduleSave();
}

export function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] ?? null;
}
