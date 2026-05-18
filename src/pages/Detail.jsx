import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, whatsappLink } from '../api';
import { useI18n } from '../i18n';

export default function Detail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .listing(id)
      .then(setListing)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="container empty">
        <p>{t('noResults')}</p>
        <Link to="/" className="btn btn-ghost">
          {t('back')}
        </Link>
      </div>
    );
  }

  if (!listing) return <p className="container empty">…</p>;

  const catLabel = lang === 'fr' ? listing.category_fr : listing.category_en;
  const msg =
    lang === 'fr'
      ? `Bonjour, je vous contacte via Annuaire Lomé pour : ${listing.name}`
      : `Hello, I'm contacting you via Lomé Directory about: ${listing.name}`;

  return (
    <div className="container page">
      <Link to="/" className="btn btn-ghost btn-sm">
        ← {t('back')}
      </Link>
      <div className="detail-header">
        {listing.is_pinned === 1 && <span className="badge">{t('pinned')}</span>}
        <h1>{listing.name}</h1>
        <p className="meta">
          {listing.icon} {catLabel}
          {listing.quartier && ` · ${listing.quartier}`}
        </p>
        {listing.description && <p>{listing.description}</p>}
        {listing.address && (
          <p className="meta">
            📍 {listing.address}
          </p>
        )}
        {listing.phone && (
          <p className="meta">
            📞 {listing.phone}
          </p>
        )}
      </div>
      <div className="detail-actions">
        <a
          className="btn btn-whatsapp"
          href={whatsappLink(listing.whatsapp, msg)}
          target="_blank"
          rel="noreferrer"
        >
          {t('contactWhatsApp')}
        </a>
      </div>
    </div>
  );
}
