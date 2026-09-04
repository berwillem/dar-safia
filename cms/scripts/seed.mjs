/**
 * ══════════════════════════════════════════════════════════════
 *   SEED STRAPI — CATALOGUE DAR SAFIA
 * ══════════════════════════════════════════════════════════════
 *
 * Peuple une instance Strapi (déjà démarrée) à partir de catalog-data.js :
 * marques, notes olfactives, puis parfums avec leurs relations.
 *
 * Prérequis :
 *   - Strapi accessible (STRAPI_URL, défaut http://localhost:1337)
 *   - un token d'API en écriture : STRAPI_SEED_TOKEN
 *     (Admin > Paramètres > API Tokens > type « Full access »)
 *
 * Lancement :
 *   STRAPI_URL=http://localhost:1337 STRAPI_SEED_TOKEN=xxxx \
 *     node cms/scripts/seed.mjs
 *
 * Idempotent : un parfum / une marque / une note déjà présent (même slug)
 * est ignoré, pas dupliqué. Relancer est sans danger.
 *
 * NB : ce script transforme les mêmes données que
 * scripts/migrate-catalog.mjs, mais vers la forme des types de contenu
 * Strapi (composants inline, relations par documentId).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const { perfumeCatalog } = await import(
  pathToFileURL(path.join(ROOT, 'catalog-data.js')).href
);

const STRAPI_URL = (process.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_SEED_TOKEN;

if (!TOKEN) {
  console.error(
    'STRAPI_SEED_TOKEN manquant. Créez un token « Full access » dans\n' +
      'Strapi > Paramètres > API Tokens, puis relancez avec\n' +
      'STRAPI_SEED_TOKEN=xxxx node cms/scripts/seed.mjs'
  );
  process.exit(1);
}

// ── Client REST minimal ────────────────────────────────────────

async function api(method, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint} -> ${res.status}\n${text}`);
  }
  return res.json();
}

/** documentId d'une entrée existante (par slug), ou null. */
async function findBySlug(plural, slug) {
  const res = await api(
    'GET',
    `${plural}?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=slug`
  );
  return res.data?.[0]?.documentId ?? null;
}

/** Crée l'entrée si absente ; retourne son documentId. */
async function upsert(plural, slug, data) {
  const existing = await findBySlug(plural, slug);
  if (existing) {
    console.log(`  = ${plural}/${slug} (déjà présent)`);
    return existing;
  }
  const created = await api('POST', plural, data);
  console.log(`  + ${plural}/${slug}`);
  return created.data.documentId;
}

// ── Transformations (miroir de scripts/migrate-catalog.mjs) ─────

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productSlug(name, brand) {
  const n = slugify(name);
  const b = slugify(brand);
  return n.startsWith(b) ? n : `${b}-${n}`;
}

const parseVolumeMl = (v) => {
  const m = /(\d+)\s*ml/i.exec(v ?? '');
  return m ? Number(m[1]) : null;
};
const parseLongevity = (v) => {
  const m = /(\d+)/.exec(v ?? '');
  return m ? Number(m[1]) : null;
};
function parseSillage(s) {
  const t = (s ?? '').toLowerCase();
  if (/monumental|légendaire|dévastateur|infini|puissant|intense|xxl/.test(t)) return 5;
  if (/magnétique|envoûtant|opulent|incandescent|triomphal|addictif|hypnotique/.test(t)) return 4;
  if (/frais|propre|léger|subtil|discret|épuré/.test(t)) return 2;
  return 3;
}
const splitNotes = (v) =>
  String(v ?? '').split(',').map((n) => n.trim()).filter(Boolean);

function inferSeasons(family, text) {
  const t = text.toLowerCase();
  if (/marin|aquatique|agrumes|pamplemousse|menthe|frais/.test(t)) return ['printemps', 'ete'];
  if (/vanille|ambre|oud|cuir|tabac|cannelle|encens/.test(t)) return ['automne', 'hiver'];
  if (family === 'floral') return ['printemps', 'ete'];
  if (family === 'woody' || family === 'amber') return ['automne', 'hiver'];
  return ['toutes'];
}
function inferOccasions(concentration) {
  return /toilette/i.test(concentration ?? '')
    ? ['jour', 'bureau', 'quotidien']
    : ['soir', 'ceremonie'];
}

// ── Exécution ──────────────────────────────────────────────────

console.log(`Seed vers ${STRAPI_URL}\n`);

// 1. Marques
console.log('Marques');
const brandId = new Map();
for (const name of [...new Set(perfumeCatalog.map((p) => p.brand))]) {
  const slug = slugify(name);
  brandId.set(name, await upsert('brands', slug, { name, slug }));
}

// 2. Notes olfactives
console.log('\nNotes olfactives');
const noteId = new Map();
for (const perfume of perfumeCatalog) {
  for (const layer of ['top', 'heart', 'base']) {
    for (const noteName of splitNotes(perfume[layer])) {
      const slug = slugify(noteName);
      if (noteId.has(slug)) continue;
      noteId.set(slug, await upsert('fragrance-notes', slug, { name: noteName, slug }));
    }
  }
}

// 3. Parfums
console.log('\nParfums');
const takenSlugs = new Set();
for (const old of perfumeCatalog) {
  let slug = productSlug(old.name, old.brand);
  let n = 2;
  const bare = slug;
  while (takenSlugs.has(slug)) slug = `${bare}-${n++}`;
  takenSlugs.add(slug);

  const sillage = parseSillage(old.sillage);
  const searchText = [old.desc, old.story, old.top, old.heart, old.base].join(' ');
  const secondary = (old.catLabels ?? []).filter(
    (l) =>
      l !== old.gender &&
      l !== old.category &&
      ['floral', 'amber', 'woody', 'fresh', 'gourmand', 'spicy'].includes(l)
  );

  const notes = [];
  for (const layer of ['top', 'heart', 'base']) {
    splitNotes(old[layer]).forEach((noteName, position) => {
      notes.push({ note: noteId.get(slugify(noteName)), layer, position });
    });
  }

  await upsert('products', slug, {
    name: old.name,
    slug,
    brand: brandId.get(old.brand),
    description: old.desc,
    story: old.story,
    gender: old.gender,
    family: old.category,
    secondaryFamilies: secondary,
    notes,
    variants: [
      {
        volumeMl: parseVolumeMl(old.volume),
        price: { amount: old.price, currency: 'DZD' },
        stock: 0,
      },
    ],
    concentration: old.concentration,
    longevityHours: parseLongevity(old.longevity),
    sillage,
    seasons: inferSeasons(old.category, searchText),
    occasions: inferOccasions(old.concentration),
    badge: old.badge,
    featured: Boolean(old.badge && /coup de c|best seller|iconique|légende|chef/i.test(old.badge)),
    newArrival: /nouveauté/i.test(old.badge ?? ''),
    bestseller: /best seller/i.test(old.badge ?? ''),
    seo: {
      metaTitle: slugify(old.name).includes(slugify(old.brand))
        ? old.name
        : `${old.name} — ${old.brand}`,
      metaDescription: old.desc.slice(0, 155),
    },
    publishedAt: new Date().toISOString(),
  });
}

console.log(
  `\n✓ Terminé. ${brandId.size} marques, ${noteId.size} notes, ${perfumeCatalog.length} parfums.`
);
console.log('  Images, stock, saisons/occasions : à revoir dans l\'admin.');
