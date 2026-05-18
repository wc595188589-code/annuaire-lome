import { useEffect, useState } from 'react';
import { api, whatsappLink } from '../api';
import { useI18n } from '../i18n';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const { t, categoryName } = useI18n();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [ads, setAds] = useState([]);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then(setCategories).catch(console.error);
    api.ads().then(setAds).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.q = search;
    if (category) params.category = category;
    if (type) params.type = type;
    api
      .listings(params)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(q.trim());
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>{t('appName')}</h1>
        <p>{t('tagline')}</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder={t('search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            OK
          </button>
        </form>
        <div className="cash-badge">💵 {t('cashOnly')}</div>
      </section>

      {ads.map((ad) => (
        <div key={ad.id} className="ad-banner">
          <div>
            <h4>{ad.title}</h4>
            {ad.subtitle && <p>{ad.subtitle}</p>}
          </div>
          {ad.whatsapp && (
            <a
              className="btn btn-whatsapp btn-sm"
              href={whatsappLink(ad.whatsapp, ad.title)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          )}
        </div>
      ))}

      <div className="cat-scroll">
        <button
          type="button"
          className={`cat-chip${!category ? ' active' : ''}`}
          onClick={() => setCategory('')}
        >
          {t('all')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cat-chip${category === c.slug ? ' active' : ''}`}
            onClick={() => setCategory(c.slug)}
          >
            {c.icon} {categoryName(c)}
          </button>
        ))}
      </div>

      <div className="type-tabs">
        <button type="button" className={!type ? 'active' : ''} onClick={() => setType('')}>
          {t('all')}
        </button>
        <button
          type="button"
          className={type === 'business' ? 'active' : ''}
          onClick={() => setType('business')}
        >
          {t('business')}
        </button>
        <button
          type="button"
          className={type === 'craftsman' ? 'active' : ''}
          onClick={() => setType('craftsman')}
        >
          {t('craftsman')}
        </button>
      </div>

      {loading ? (
        <p className="empty">…</p>
      ) : listings.length === 0 ? (
        <p className="empty">{t('noResults')}</p>
      ) : (
        <div className="listing-grid">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
