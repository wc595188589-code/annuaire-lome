import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

export default function Admin() {
  const { t } = useI18n();
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const [s, l, p, a] = await Promise.all([
        api.adminStats(),
        api.adminListings(tab === 'all' ? undefined : tab),
        api.adminPayments(),
        api.adminAds(),
      ]);
      setStats(s);
      setListings(l);
      setPayments(p.filter((x) => x.status === 'pending'));
      setAds(a);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        localStorage.removeItem('adminToken');
        setToken(null);
      }
    }
  };

  useEffect(() => {
    load();
  }, [token, tab]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token: tkn } = await api.adminLogin(password);
      localStorage.setItem('adminToken', tkn);
      setToken(tkn);
    } catch {
      setError('Invalid password');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const patchListing = async (id, body) => {
    await api.adminPatchListing(id, body);
    load();
  };

  const patchPayment = async (id, status) => {
    await api.adminPatchPayment(id, { status });
    load();
  };

  if (!token) {
    return (
      <div className="container page">
        <h2>{t('admin')} — {t('login')}</h2>
        <form onSubmit={login}>
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button type="submit" className="btn btn-primary">
            {t('login')}
          </button>
        </form>
        <p className="meta" style={{ marginTop: '1rem' }}>
          Démo : mot de passe <code>lome2026</code>
        </p>
      </div>
    );
  }

  return (
    <div className="container admin-layout">
      <nav className="admin-nav">
        <button type="button" className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>
          {t('pending')}
        </button>
        <button type="button" className={tab === 'approved' ? 'active' : ''} onClick={() => setTab('approved')}>
          {t('approved')}
        </button>
        <button type="button" className={tab === 'rejected' ? 'active' : ''} onClick={() => setTab('rejected')}>
          {t('rejected')}
        </button>
        <button type="button" className={tab === 'payments' ? 'active' : ''} onClick={() => setTab('payments')}>
          {t('payments')}
        </button>
        <button type="button" className={tab === 'ads' ? 'active' : ''} onClick={() => setTab('ads')}>
          {t('ads')}
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={logout}>
          {t('logout')}
        </button>
      </nav>

      <div>
        {stats && (
          <div className="stat-cards">
            <div className="stat-card">
              <div className="num">{stats.pending}</div>
              <div>{t('pending')}</div>
            </div>
            <div className="stat-card">
              <div className="num">{stats.approved}</div>
              <div>{t('approved')}</div>
            </div>
            <div className="stat-card">
              <div className="num">{stats.payments}</div>
              <div>{t('payments')}</div>
            </div>
          </div>
        )}

        {tab === 'payments' ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('type')}</th>
                  <th>FCFA</th>
                  <th>Contact</th>
                  <th>Fiche</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.type}</td>
                    <td>{p.amount_fcfa}</td>
                    <td>
                      {p.contact_name}
                      <br />
                      <small>{p.contact_phone}</small>
                    </td>
                    <td>{p.listing_name || '—'}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => patchPayment(p.id, 'paid')}
                      >
                        {t('markPaid')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'ads' ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('name')}</th>
                  <th>WhatsApp</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.title}</td>
                    <td>{a.whatsapp}</td>
                    <td>{a.active ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('type')}</th>
                  <th>{t('quartier')}</th>
                  <th>{t('status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.type}</td>
                    <td>{l.quartier}</td>
                    <td>{l.status}</td>
                    <td className="actions">
                      {l.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => patchListing(l.id, { status: 'approved' })}
                          >
                            {t('approve')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => patchListing(l.id, { status: 'rejected' })}
                          >
                            {t('reject')}
                          </button>
                        </>
                      )}
                      {l.status === 'approved' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            patchListing(l.id, { is_pinned: l.is_pinned ? 0 : 1 })
                          }
                        >
                          {l.is_pinned ? t('unpin') : t('pin')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
