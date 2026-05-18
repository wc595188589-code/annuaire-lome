# Annuaire Lomé 🇹🇬

Annuaire local pour **Lomé, Togo** — commerces, artisans, recherche par catégorie, mise en avant payante et publicités. **Paiement cash uniquement**, pas de paiement en ligne.

## Stack

- **Frontend** : Vite + React
- **Backend** : Express (Node 20+)
- **Base de données** : [sql.js](https://github.com/sql-js/sql.js) (SQLite en WASM, **aucune compilation native** — fonctionne sur Windows Node 24)

## Fonctionnalités

| Fonction | Description |
|----------|-------------|
| Commerce / Artisan | Inscription avec validation admin |
| Catégories | Restaurants, plomberie, coiffure, transport… |
| Recherche | Mot-clé, quartier, type, catégorie |
| Mise en avant | Fiches épinglées (frais cash) |
| WhatsApp | Contact direct depuis chaque fiche |
| Bilingue | Français / English |
| Admin | Approbation, paiements cash, publicités |
| Revenus | Frais d'inscription, mise en avant, bannières pub |

## Démarrage rapide

```bash
npm install
npm run dev
```

- **Site** : http://localhost:5173  
- **API** : http://localhost:3001  

### Production

```bash
npm run build
set NODE_ENV=production
npm start
```

Le serveur Express sert le build Vite et l'API sur le port **3001**.

## Admin

- URL : `/admin`
- Mot de passe par défaut : `lome2026`  
  (modifiable dans la table `settings`, clé `admin_password`)

## Tarifs par défaut (FCFA, cash)

| Type | Montant |
|------|---------|
| Inscription commerce/artisan | 5 000 |
| Mise en avant (30 jours) | 10 000 |
| Bannière publicitaire | 25 000 |

Les montants sont dans `data/annuaire.db` → table `settings`.

## Structure

```
annuaire-lome/
├── server/           # Express + sql.js
│   ├── db.js
│   ├── index.js
│   └── routes/
├── src/              # React
├── data/             # SQLite persisté (créé au 1er lancement)
├── package.json
└── vite.config.js
```

## Notes Lomé

- Numéros WhatsApp au format `+228…`
- Quartiers : Adidogomé, Tokoin, Bé, Port, Grand Marché, etc.
- Aucune intégration Mobile Money / carte — tout se règle en espèces au bureau ou sur WhatsApp.
