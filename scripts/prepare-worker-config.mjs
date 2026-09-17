import { readFile, writeFile } from 'node:fs/promises';

const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();
const siteOrigin = process.env.LEVELUP_SITE_ORIGIN?.trim();
const adminUsername = process.env.LEVELUP_ADMIN_USERNAME?.trim() || 'admin';
if (!databaseId || !siteOrigin) throw new Error('CLOUDFLARE_D1_DATABASE_ID and LEVELUP_SITE_ORIGIN are required.');

const templateUrl = new URL('../worker/wrangler.template.toml', import.meta.url);
const outputUrl = new URL('../worker/wrangler.ci.toml', import.meta.url);
const template = await readFile(templateUrl, 'utf8');
const safe = (value) => value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '');
const output = template
  .replace('__D1_DATABASE_ID__', safe(databaseId))
  .replace('__SITE_ORIGIN__', safe(siteOrigin))
  .replace('__ADMIN_USERNAME__', safe(adminUsername));
await writeFile(outputUrl, output);
