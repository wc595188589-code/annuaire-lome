import { db } from './db.js';
import crypto from 'crypto';

const now = new Date().toISOString();
const id = () => crypto.randomUUID();

const categories = [
  { id: 'biz-commerce', type: 'business', name_fr: 'Commerce & boutique', name_en: 'Shops', icon: '🏪', sort_order: 1 },
  { id: 'biz-restaurant', type: 'business', name_fr: 'Restaurant & maquis', name_en: 'Food & maquis', icon: '🍽️', sort_order: 2 },
  { id: 'biz-pharmacie', type: 'business', name_fr: 'Pharmacie & santé', name_en: 'Pharmacy & health', icon: '💊', sort_order: 3 },
  { id: 'biz-hotel', type: 'business', name_fr: 'Hôtel & auberge', name_en: 'Hotel & lodge', icon: '🏨', sort_order: 4 },
  { id: 'biz-transport', type: 'business', name_fr: 'Transport & garage', name_en: 'Transport & garage', icon: '🚗', sort_order: 5 },
  { id: 'biz-beaute', type: 'business', name_fr: 'Coiffure & beauté', name_en: 'Hair & beauty', icon: '💇', sort_order: 6 },
  { id: 'biz-ecole', type: 'business', name_fr: 'École & formation', name_en: 'School & training', icon: '📚', sort_order: 7 },
  { id: 'biz-autre', type: 'business', name_fr: 'Autre commerce', name_en: 'Other business', icon: '📋', sort_order: 99 },
  { id: 'art-plomberie', type: 'artisan', name_fr: 'Plomberie', name_en: 'Plumbing', icon: '🔧', sort_order: 1 },
  { id: 'art-electricite', type: 'artisan', name_fr: 'Électricité', name_en: 'Electrician', icon: '⚡', sort_order: 2 },
  { id: 'art-moto', type: 'artisan', name_fr: 'Moto-taxi (Zémidjan)', name_en: 'Moto taxi', icon: '🏍️', sort_order: 3 },
  { id: 'art-menage', type: 'artisan', name_fr: 'Ménage & femme de ménage', name_en: 'Housekeeping', icon: '🧹', sort_order: 4 },
  { id: 'art-macon', type: 'artisan', name_fr: 'Maçonnerie & construction', name_en: 'Masonry', icon: '🧱', sort_order: 5 },
  { id: 'art-mecanique', type: 'artisan', name_fr: 'Mécanique auto/moto', name_en: 'Mechanic', icon: '🔩', sort_order: 6 },
  { id: 'art-clim', type: 'artisan', name_fr: 'Climatisation & frigo', name_en: 'AC & fridge', icon: '❄️', sort_order: 7 },
  { id: 'art-temp', type: 'artisan', name_fr: 'Travail temporaire / journalier', name_en: 'Day labor / temp work', icon: '👷', sort_order: 8 },
  { id: 'art-autre', type: 'artisan', name_fr: 'Autre service', name_en: 'Other service', icon: '🛠️', sort_order: 99 },
];

const listings = [
  {
    type: 'business',
    category_id: 'biz-restaurant',
    name: 'Maquis Chez Afi',
    description_fr: 'Attiéké, poisson braisé, poulet. Ouvert 11h–23h. Livraison Tokoin.',
    description_en: 'Attieke, grilled fish, chicken. Open 11am–11pm. Tokoin delivery.',
    phone: '+22890123456',
    whatsapp: '+22890123456',
    quartier: 'Tokoin',
    address: 'Rue du 13 Janvier, Tokoin',
    is_pinned: 1,
    pinned_until: '2027-12-31',
  },
  {
    type: 'business',
    category_id: 'biz-pharmacie',
    name: 'Pharmacie du Marché',
    description_fr: 'Médicaments, parapharmacie. Garde le dimanche sur appel.',
    description_en: 'Medicine & OTC. Sunday on-call.',
    phone: '+22897234567',
    whatsapp: '+22897234567',
    quartier: 'Grand Marché',
    address: 'Face au Grand Marché',
    is_pinned: 1,
    pinned_until: '2027-06-30',
  },
  {
    type: 'artisan',
    category_id: 'art-moto',
    name: 'Koffi — Zémidjan Tokoin',
    description_fr: 'Courses rapides Tokoin, Adidogomé, centre-ville. Prix à discuter.',
    description_en: 'Fast rides Tokoin, Adidogome, downtown. Price negotiable.',
    phone: '+22870345678',
    whatsapp: '+22870345678',
    quartier: 'Tokoin',
    is_pinned: 1,
    pinned_until: '2027-12-31',
  },
  {
    type: 'artisan',
    category_id: 'art-plomberie',
    name: 'Plombier Esso',
    description_fr: 'Fuites, installation chauffe-eau, débouchage. Déplacement Bé–Hanoukopé.',
    description_en: 'Leaks, water heater, unblocking. Bé to Hanoukope.',
    phone: '+22891456789',
    whatsapp: '+22891456789',
    quartier: 'Bé',
    is_pinned: 0,
  },
  {
    type: 'artisan',
    category_id: 'art-menage',
    name: 'Amina — Ménage à domicile',
    description_fr: 'Ménage, repassage, garde enfants. Références disponibles.',
    description_en: 'Cleaning, ironing, childcare. References available.',
    phone: '+22892567890',
    whatsapp: '+22892567890',
    quartier: 'Adidogomé',
    is_pinned: 0,
  },
  {
    type: 'artisan',
    category_id: 'art-temp',
    name: 'Équipe journaliers Agoè',
    description_fr: 'Manutention, peinture, aide chantier. Paiement journalier cash.',
    description_en: 'Labor, painting, site help. Daily cash pay.',
    phone: '+22893678901',
    whatsapp: '+22893678901',
    quartier: 'Agoè',
    is_pinned: 0,
  },
];

const ads = [
  {
    position: 'banner_top',
    title_fr: 'Espace pub — Bannière haut',
    title_en: 'Ad space — Top banner',
    subtitle_fr: 'Contactez-nous : +228 90 00 00 00 (WhatsApp)',
    subtitle_en: 'Contact us: +228 90 00 00 00 (WhatsApp)',
    bg_color: '#006A4E',
    text_color: '#ffffff',
    link_url: 'https://wa.me/22890000000',
    sort_order: 1,
  },
  {
    position: 'banner_mid',
    title_fr: 'Votre commerce ici ?',
    title_en: 'Your shop here?',
    subtitle_fr: 'Inscription cash dès 5 000 FCFA',
    subtitle_en: 'Cash listing from 5,000 FCFA',
    bg_color: '#FFD100',
    text_color: '#1a1a1a',
    link_url: '#/tarifs',
    sort_order: 1,
  },
];

db.transaction(() => {
  db.prepare('DELETE FROM listings').run();
  db.prepare('DELETE FROM categories').run();
  db.prepare('DELETE FROM ads').run();

  const insCat = db.prepare(
    `INSERT INTO categories (id, type, name_fr, name_en, icon, sort_order) VALUES (@id, @type, @name_fr, @name_en, @icon, @sort_order)`
  );
  for (const c of categories) insCat.run(c);

  const insList = db.prepare(`
    INSERT INTO listings (id, type, category_id, name, description_fr, description_en, phone, whatsapp, quartier, address, status, is_pinned, pinned_until, created_at, approved_at)
    VALUES (@id, @type, @category_id, @name, @description_fr, @description_en, @phone, @whatsapp, @quartier, @address, 'approved', @is_pinned, @pinned_until, @created_at, @approved_at)
  `);
  for (const l of listings) {
    insList.run({
      id: id(),
      ...l,
      is_pinned: l.is_pinned ? 1 : 0,
      created_at: now,
      approved_at: now,
    });
  }

  const insAd = db.prepare(`
    INSERT INTO ads (id, position, title_fr, title_en, subtitle_fr, subtitle_en, link_url, bg_color, text_color, active, sort_order)
    VALUES (@id, @position, @title_fr, @title_en, @subtitle_fr, @subtitle_en, @link_url, @bg_color, @text_color, 1, @sort_order)
  `);
  for (const a of ads) insAd.run({ id: id(), ...a });
})();

console.log('✓ Base de données initialisée (Lomé demo data)');
