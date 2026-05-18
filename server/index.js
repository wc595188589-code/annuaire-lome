import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, persistNow } from './db.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, city: 'Lomé', country: 'Togo' });
});

if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

await initDb();

const server = app.listen(PORT, () => {
  console.log(`\n🇹🇬 Annuaire Lomé API → http://localhost:${PORT}`);
  if (!isProd) console.log(`   Frontend Vite  → http://localhost:5173\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} déjà utilisé. Fermez l'autre processus Node ou lancez : set PORT=3002 && npm run dev\n`);
    process.exit(1);
  }
  throw err;
});

process.on('SIGINT', () => {
  persistNow();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  persistNow();
  server.close(() => process.exit(0));
});
