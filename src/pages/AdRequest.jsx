import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';

export default function AdRequest() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: '',
    contact_name: '',
    contact_phone: '',
    notes: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.requestAd(form);
      setDone(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (done) {
    return (
      <div className="container page">
        <div className="alert alert-success">
          <h2>{t('pendingTitle')}</h2>
          <p>
            {t('payAtOffice')} — 25 000 {t('fcfa')} ({t('cashOnly')})
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h2>{t('adContact')}</h2>
      <p className="cash-badge">💵 {t('cashOnly')}</p>
      <div className="fee-box">
        Bannière accueil — <strong>25 000 {t('fcfa')}</strong> / mois
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('name')} / Entreprise</label>
          <input value={form.contact_name} onChange={set('contact_name')} />
        </div>
        <div className="form-group">
          <label>{t('whatsapp')} *</label>
          <input required value={form.contact_phone} onChange={set('contact_phone')} />
        </div>
        <div className="form-group">
          <label>{t('notes')}</label>
          <textarea value={form.notes} onChange={set('notes')} placeholder={t('adSpace')} />
        </div>
        <button type="submit" className="btn btn-primary">
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
