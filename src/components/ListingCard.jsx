import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function ListingCard({ listing }) {
  const { t, lang } = useI18n();
  const catLabel = lang === 'fr' ? listing.category_fr : listing.category_en;
  const isPinned = listing.is_pinned === 1;

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={`listing-card${isPinned ? ' pinned' : ''}`}
    >
      {isPinned && <span className="badge">{t('pinned')}</span>}
      <span className={`badge ${listing.type === 'craftsman' ? 'craftsman' : ''}`}>
        {listing.type === 'craftsman' ? t('craftsman') : t('business')}
      </span>
      <h3>
        {listing.icon && <span>{listing.icon} </span>}
        {listing.name}
      </h3>
      <div className="meta">
        {catLabel && <span>{catLabel}</span>}
        {listing.quartier && <span> · {listing.quartier}</span>}
      </div>
      {listing.description && <p className="desc">{listing.description}</p>}
    </Link>
  );
}
