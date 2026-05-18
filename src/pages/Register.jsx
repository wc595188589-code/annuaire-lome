import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';

export default function Register() {
  const { type: routeType } = useParams();
  const type = routeType === 'craftsman' ? 'craftsman' : 'business';
  const { t, categoryName } = useI18n();

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    phone: '',
    whatsapp: '',
    address: '',
    quartier: '',
    request_pin: false,
  });

  useEffect(() => {
    api.categories().then(setCategories).catch(console.error);
    api.settings().then(setSettings).catch(console.error);
  }, []);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register({
        type,
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
      });
      setDone(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="container page">
        <div className="alert alert-success">
          <h2>{t('pendingTitle')}</h2>
          <p>{t('pendingMsg')}</p>
        </div>
        <Link to="/" className="btn btn-primary">
          {t('home')}
        </Link>
      </div>
    );
  }

  const regFee = settings.registration_fee_fcfa || '5000';
  const pinFee = settings.pin_fee_fcfa || '10000';

  return (
    <div className="container page">
      <h2>{type === 'craftsman' ? t('registerCraftsman') : t('registerBusiness')}</h2>
      <p className="cash-badge">💵 {t('cashOnly')}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('name')} *</label>
          <input required value={form.name} onChange={set('name')} />
        </div>
        <div className="form-group">
          <label>{t('description')}</label>
          <textarea value={form.description} onChange={set('description')} />
        </div>
        <div className="form-group">
          <label>{t('category')}</label>
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {categoryName(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t('whatsapp')} *</label>
          <input
            required
            placeholder="+228..."
            value={form.whatsapp}
            onChange={set('whatsapp')}
          />
        </div>
        <div className="form-group">
          <label>{t('phone')}</label>
          <input value={form.phone} onChange={set('phone')} />
        </div>
        <div className="form-group">
          <label>{t('quartier')}</label>
          <input
            placeholder="Adidogomé, Tokoin, Bé..."
            value={form.quartier}
            onChange={set('quartier')}
          />
        </div>
        <div className="form-group">
          <label>{t('address')}</label>
          <input value={form.address} onChange={set('address')} />
        </div>

        <div className="fee-box">
          <p>
            {t('registrationFee')}: <strong>{regFee} {t('fcfa')}</strong> ({t('payAtOffice')})
          </p>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.request_pin}
              onChange={set('request_pin')}
            />
            <span>
              {t('requestPin')} — {pinFee} {t('fcfa')}
            </span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '…' : t('submit')}
        </button>
      </form>
    </div>
  );
}
