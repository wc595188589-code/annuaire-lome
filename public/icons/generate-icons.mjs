/** Run once: node public/icons/generate-icons.mjs — creates PNG placeholders */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
// Minimal valid 1x1 green PNG (base64) scaled via copy for demo — replace with real branding
const png192 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(path.join(dir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(dir, 'icon-512.png'), png192);
console.log('Icons written (replace with 192x512 branded assets)');
