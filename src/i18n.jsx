import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  fr: {
    appName: 'Annuaire Lomé',
    tagline: 'Commerces & artisans de Lomé',
    search: 'Rechercher…',
    categories: 'Catégories',
    all: 'Tout',
    business: 'Commerces',
    craftsman: 'Artisans',
    pinned: 'À la une',
    contactWhatsApp: 'Contacter sur WhatsApp',
    register: "S'inscrire",
    registerBusiness: 'Inscrire mon commerce',
    registerCraftsman: 'Inscrire mon activité',
    home: 'Accueil',
    admin: 'Admin',
    language: 'Langue',
    quartier: 'Quartier',
    address: 'Adresse',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
    name: 'Nom',
    description: 'Description',
    category: 'Catégorie',
    submit: 'Envoyer',
    pendingTitle: 'Demande envoyée',
    pendingMsg:
      'Votre fiche est en attente de validation. Payez les frais d\'inscription en espèces (cash) à notre bureau ou via notre WhatsApp officiel. Nous vous contacterons sous 24–48 h.',
    cashOnly: 'Paiement cash uniquement — pas de paiement en ligne',
    registrationFee: "Frais d'inscription",
    pinFee: 'Mise en avant (option)',
    requestPin: 'Demander la mise en avant',
    fcfa: 'FCFA',
    adSpace: 'Espace publicitaire',
    adContact: 'Réserver une bannière',
    noResults: 'Aucun résultat',
    back: 'Retour',
    detail: 'Fiche',
    login: 'Connexion',
    password: 'Mot de passe',
    logout: 'Déconnexion',
    dashboard: 'Tableau de bord',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Refusé',
    approve: 'Approuver',
    reject: 'Refuser',
    pin: 'Épingler',
    unpin: 'Retirer',
    payments: 'Paiements',
    markPaid: 'Marquer payé',
    listings: 'Fiches',
    ads: 'Publicités',
    stats: 'Statistiques',
    type: 'Type',
    status: 'Statut',
    notes: 'Notes',
    save: 'Enregistrer',
    filter: 'Filtrer',
    renewPin: 'Renouveler mise en avant',
    payAtOffice: 'Payer en cash au bureau',
  },
  en: {
    appName: 'Lomé Directory',
    tagline: 'Local businesses & craftsmen in Lomé',
    search: 'Search…',
    categories: 'Categories',
    all: 'All',
    business: 'Businesses',
    craftsman: 'Craftsmen',
    pinned: 'Featured',
    contactWhatsApp: 'Contact on WhatsApp',
    register: 'Register',
    registerBusiness: 'Register my business',
    registerCraftsman: 'Register my service',
    home: 'Home',
    admin: 'Admin',
    language: 'Language',
    quartier: 'Neighborhood',
    address: 'Address',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    name: 'Name',
    description: 'Description',
    category: 'Category',
    submit: 'Submit',
    pendingTitle: 'Request submitted',
    pendingMsg:
      'Your listing is pending review. Pay the registration fee in cash at our office or via our official WhatsApp. We will contact you within 24–48 hours.',
    cashOnly: 'Cash payment only — no online payment',
    registrationFee: 'Registration fee',
    pinFee: 'Featured listing (optional)',
    requestPin: 'Request featured placement',
    fcfa: 'FCFA',
    adSpace: 'Ad space',
    adContact: 'Book a banner',
    noResults: 'No results',
    back: 'Back',
    detail: 'Listing',
    login: 'Login',
    password: 'Password',
    logout: 'Logout',
    dashboard: 'Dashboard',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    pin: 'Pin',
    unpin: 'Unpin',
    payments: 'Payments',
    markPaid: 'Mark paid',
    listings: 'Listings',
    ads: 'Ads',
    stats: 'Statistics',
    type: 'Type',
    status: 'Status',
    notes: 'Notes',
    save: 'Save',
    filter: 'Filter',
    renewPin: 'Renew featured',
    payAtOffice: 'Pay cash at office',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');

  const setLanguage = useCallback((l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  }, []);

  const t = useCallback((key) => translations[lang][key] ?? key, [lang]);

  const categoryName = useCallback(
    (cat) => (lang === 'fr' ? cat?.name_fr : cat?.name_en) || cat?.name_fr || '',
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t, categoryName }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
