import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function Layout({ children }) {
  const { t, lang, setLanguage } = useI18n();
  const location = useLocation();

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-flag">🇹🇬</span>
            <span>{t('appName')}</span>
          </Link>
          <nav className="nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              {t('home')}
            </Link>
            <Link to="/register/business">{t('registerBusiness')}</Link>
            <Link to="/register/craftsman">{t('registerCraftsman')}</Link>
            <Link to="/ad">{t('adSpace')}</Link>
            <Link to="/admin">{t('admin')}</Link>
            <div className="lang-toggle">
              <button
                type="button"
                className={lang === 'fr' ? 'active' : ''}
                onClick={() => setLanguage('fr')}
              >
                FR
              </button>
              <button
                type="button"
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container">
          🇹🇬 Lomé, Togo — {t('cashOnly')}
        </div>
      </footer>
    </>
  );
}
