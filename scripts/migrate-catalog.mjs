/**
 * ══════════════════════════════════════════════════════════════
 *   MIGRATION DU CATALOGUE VERS LE MODÈLE DE DOMAINE
 * ══════════════════════════════════════════════════════════════
 *
 * Transforme les 45 parfums du site actuel (tableau plat, champs texte)
 * vers la forme définie dans domain/catalog.d.ts.
 *
 * Ce script est aussi le futur script de seed Strapi (phase 3) : la forme
 * qu'il produit est exactement celle que le CMS devra renvoyer.
 *
 * Lancement : node scripts/migrate-catalog.mjs
 * Sortie    : web/src/data/products.json  +  brands.json  +  notes.json
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { perfumeCatalog } from '../catalog-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'web', 'src', 'data');

/** Largeurs générées par le pipeline d'images, par dossier. */
const SRCSET_WIDTHS = { '/img/perfumes/': [400, 800] };

// ── Utilitaires ────────────────────────────────────────────────

/**
 * Slug URL : minuscules, accents retirés, ponctuation supprimée.
 * "Givenchy L'Interdit Rouge Ultime" -> "givenchy-l-interdit-rouge-ultime"
 */
function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // diacritiques
    .replace(/[’']/g, ' ')             // apostrophes droites et typographiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug produit. La plupart des `name` du catalogue contiennent déjà la marque
 * ('Prada Paradoxe'), d'autres non ('Fame In Love'). On ne préfixe donc que
 * si nécessaire, pour éviter 'prada-prada-paradoxe'.
 */
function productSlug(name, brand) {
  const nameSlug = slugify(name);
  const brandSlug = slugify(brand);
  return nameSlug.startsWith(brandSlug) ? nameSlug : `${brandSlug}-${nameSlug}`;
}

/** Garantit l'unicité d'un slug en suffixant -2, -3… si nécessaire. */
function uniqueSlug(base, taken) {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

function buildSrcset(url) {
  const prefix = Object.keys(SRCSET_WIDTHS).find(d => url.startsWith(d));
  if (!prefix) return null;
  const stem = url.replace(/\.webp$/, '');
  return SRCSET_WIDTHS[prefix].map(w => `${stem}-${w}.webp ${w}w`).join(', ');
}

/**
 * '90ml Eau de Parfum' -> 90. Retourne null si aucune contenance lisible
 * (ex. 'Coffret Prestige'), plutôt que d'inventer une valeur.
 */
function parseVolumeMl(volume) {
  const match = /(\d+)\s*ml/i.exec(volume || '');
  return match ? Number(match[1]) : null;
}

/** '48h+' -> 48, '72h' -> 72. Le '+' est perdu : c'était du marketing, pas une donnée. */
function parseLongevityHours(longevity) {
  const match = /(\d+)/.exec(longevity || '');
  return match ? Number(match[1]) : null;
}

/**
 * Traduit un sillage textuel en échelle 1–5.
 * Les libellés d'origine ('Puissant & Rayonnant', 'Discret') sont du texte
 * libre : on les classe par mots-clés, et on retombe sur 3 (médian) si aucun
 * ne correspond, plutôt que d'affirmer une valeur extrême.
 */
function parseSillage(sillage) {
  const s = (sillage || '').toLowerCase();
  if (/monumental|légendaire|dévastateur|infini|puissant|intense|xxl/.test(s)) return 5;
  if (/magnétique|envoûtant|opulent|incandescent|triomphal|addictif|hypnotique/.test(s)) return 4;
  if (/frais|propre|léger|subtil|discret|épuré/.test(s)) return 2;
  return 3;
}

/** Découpe 'Néroli de Calabre, Bergamote, Mandarine' en notes individuelles. */
function splitNotes(value) {
  return String(value || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean);
}

/**
 * Déduit les saisons depuis la famille et les notes. Le catalogue d'origine
 * ne porte pas cette information ; ces valeurs sont des points de départ
 * éditoriaux, à corriger dans Strapi, pas des faits.
 */
function inferSeasons(family, text) {
  const t = text.toLowerCase();
  if (/marin|aquatique|agrumes|pamplemousse|menthe|frais/.test(t)) return ['printemps', 'ete'];
  if (/vanille|ambre|oud|cuir|tabac|cannelle|encens/.test(t)) return ['automne', 'hiver'];
  if (family === 'floral') return ['printemps', 'ete'];
  if (family === 'woody' || family === 'amber') return ['automne', 'hiver'];
  return ['toutes'];
}

function inferOccasions(concentration, sillage) {
  const occasions = [];
  if (/toilette/i.test(concentration || '')) occasions.push('jour', 'bureau', 'quotidien');
  else occasions.push('soir', 'ceremonie');
  if (sillage >= 5) occasions.push('ceremonie');
  return [...new Set(occasions)];
}

// ── Transformation ─────────────────────────────────────────────

function migrate() {
  const brandsBySlug = new Map();
  const notesBySlug = new Map();
  const productSlugs = new Set();

  const products = perfumeCatalog.map(old => {
    // ── Marque (dédupliquée) ──
    const brandSlug = slugify(old.brand);
    if (!brandsBySlug.has(brandSlug)) {
      brandsBySlug.set(brandSlug, { id: brandSlug, slug: brandSlug, name: old.brand });
    }

    // ── Notes olfactives (dédupliquées, reliées) ──
    const productNotes = [];
    for (const layer of ['top', 'heart', 'base']) {
      splitNotes(old[layer]).forEach((noteName, position) => {
        const noteSlug = slugify(noteName);
        if (!notesBySlug.has(noteSlug)) {
          notesBySlug.set(noteSlug, { id: noteSlug, slug: noteSlug, name: noteName });
        }
        productNotes.push({ noteSlug, layer, position });
      });
    }

    const sillage = parseSillage(old.sillage);
    const searchText = [old.desc, old.story, old.top, old.heart, old.base].join(' ');
    const volumeMl = parseVolumeMl(old.volume);

    // Familles secondaires : catLabels moins le genre et la famille principale.
    const secondaryFamilies = (old.catLabels || [])
      .filter(l => l !== old.gender && l !== old.category)
      .filter(l => ['floral', 'amber', 'woody', 'fresh', 'gourmand', 'spicy'].includes(l));

    return {
      id: String(old.id),
      slug: uniqueSlug(productSlug(old.name, old.brand), productSlugs),
      name: old.name,
      brandSlug,

      description: old.desc,
      story: old.story,

      gender: old.gender,
      family: old.category,
      secondaryFamilies,

      notes: productNotes,

      variants: [{
        id: `${old.id}-default`,
        volumeMl,
        price: { amount: old.price, currency: 'DZD' },
        // Le catalogue d'origine n'a pas de stock : on part d'une valeur
        // neutre plutôt que d'affirmer « En Stock » comme le fait le site.
        stock: 0
      }],

      images: [{
        url: old.img,
        srcset: buildSrcset(old.img),
        alt: `${old.name} — ${old.brand}`
      }],

      concentration: old.concentration,
      longevityHours: parseLongevityHours(old.longevity),
      sillage,

      seasons: inferSeasons(old.category, searchText),
      occasions: inferOccasions(old.concentration, sillage),

      // rating volontairement ABSENT : les notes et nombres d'avis du site
      // sont inventés. Un produit sans avis réel n'affiche rien.

      badge: old.badge,
      featured: Boolean(old.badge && /coup de c|best seller|iconique|légende|chef/i.test(old.badge)),
      newArrival: /nouveauté/i.test(old.badge || ''),
      bestseller: /best seller/i.test(old.badge || ''),

      seo: {
        // Pas de suffixe « | Dar Safia » ici : le template de metadata du
        // layout Next l'ajoute déjà, et le cumuler donnait
        // « … | Dar Safia | Dar Safia ». La marque n'est ajoutée que si le
        // nom ne la contient pas déjà ('Hermès Terre d'Hermès' — pas deux fois).
        title: slugify(old.name).includes(slugify(old.brand))
          ? old.name
          : `${old.name} — ${old.brand}`,
        description: old.desc.slice(0, 155)
      }
    };
  });

  return {
    products,
    brands: [...brandsBySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    notes: [...notesBySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  };
}

// ── Exécution ──────────────────────────────────────────────────

const { products, brands, notes } = migrate();

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'products.json'), JSON.stringify(products, null, 2) + '\n', 'utf8');
await writeFile(path.join(OUT, 'brands.json'), JSON.stringify(brands, null, 2) + '\n', 'utf8');
await writeFile(path.join(OUT, 'notes.json'), JSON.stringify(notes, null, 2) + '\n', 'utf8');

// ── Rapport ────────────────────────────────────────────────────

const noVolume = products.filter(p => p.variants[0].volumeMl === null);

console.log(`✓ Catalogue migré vers ${path.relative(ROOT, OUT)}`);
console.log(`  ${products.length} parfums · ${brands.length} marques · ${notes.length} notes olfactives`);
console.log(`  familles : ${[...new Set(products.map(p => p.family))].join(', ')}`);
if (noVolume.length) {
  console.log(`  ! ${noVolume.length} sans contenance lisible : ${noVolume.map(p => p.name).join(', ')}`);
}
console.log('\n  À revoir manuellement dans le CMS (déduit, non factuel) :');
console.log('  - stock : mis à 0 partout, le catalogue d\'origine ne le portait pas');
console.log('  - seasons / occasions : déduits des notes et de la concentration');
console.log('  - rating : volontairement absent, les avis du site sont fictifs');
