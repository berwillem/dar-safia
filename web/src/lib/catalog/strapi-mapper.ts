/**
 * ══════════════════════════════════════════════════════════════
 *   STRAPI → MODÈLE DE DOMAINE
 * ══════════════════════════════════════════════════════════════
 *
 * Convertit les entités Strapi (strapi-types.ts) en objets de domaine
 * (types.ts). C'est le pendant de `hydrate()` de l'implémentation statique.
 *
 * Principe : ne jamais faire échouer une page à cause d'une donnée CMS
 * incomplète. Un champ manquant prend une valeur neutre, une entité
 * fondamentalement inexploitable (pas de slug, pas de nom) est écartée.
 */

import type {
  Brand,
  Collection,
  FragranceFamily,
  FragranceNote,
  Gender,
  Media,
  NoteLayer,
  Occasion,
  Product,
  ProductNote,
  ProductVariant,
  Season,
  SeoMetadata,
} from './types';
import type {
  StrapiBrand,
  StrapiCollection,
  StrapiMedia,
  StrapiNote,
  StrapiProduct,
  StrapiSeo,
} from './strapi-types';

const GENDERS: Gender[] = ['femme', 'homme', 'unisexe'];
const FAMILIES: FragranceFamily[] = [
  'floral',
  'amber',
  'woody',
  'fresh',
  'gourmand',
  'spicy',
];
const LAYERS: NoteLayer[] = ['top', 'heart', 'base'];
const SEASONS: Season[] = ['printemps', 'ete', 'automne', 'hiver', 'toutes'];
const OCCASIONS: Occasion[] = [
  'jour',
  'soir',
  'ceremonie',
  'bureau',
  'quotidien',
];

/** Ne garde d'un tableau JSON que les valeurs appartenant au vocabulaire. */
function keepKnown<T extends string>(value: unknown, allowed: T[]): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is T => typeof v === 'string' && allowed.includes(v as T));
}

/**
 * Résout l'URL d'un média. Strapi renvoie une URL relative (`/uploads/…`)
 * quand les fichiers sont servis par Strapi lui-même, absolue via un CDN.
 */
function mediaUrl(raw: string | undefined, base: string): string | null {
  if (!raw) return null;
  if (/^https?:\/\//.test(raw)) return raw;
  return `${base.replace(/\/$/, '')}${raw}`;
}

/** Construit un srcset à partir des `formats` générés par Strapi. */
function mediaSrcset(media: StrapiMedia, base: string): string | null {
  if (!media.formats) return null;
  const entries = Object.values(media.formats)
    .filter((f): f is NonNullable<typeof f> => Boolean(f?.url && f.width))
    .map((f) => `${mediaUrl(f.url, base)} ${f.width}w`);
  return entries.length > 0 ? entries.join(', ') : null;
}

function mapMedia(
  media: StrapiMedia | null | undefined,
  base: string,
  fallbackAlt: string
): Media | null {
  const url = mediaUrl(media?.url, base);
  if (!media || !url) return null;
  return {
    url,
    srcset: mediaSrcset(media, base),
    alt: media.alternativeText?.trim() || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

function mapSeo(
  seo: StrapiSeo | null | undefined,
  base: string
): SeoMetadata | undefined {
  if (!seo) return undefined;
  const ogImage = mapMedia(seo.ogImage, base, seo.metaTitle ?? '');
  return {
    title: seo.metaTitle ?? undefined,
    description: seo.metaDescription ?? undefined,
    ogImage: ogImage ?? undefined,
  };
}

export function mapBrand(
  brand: StrapiBrand | null | undefined,
  base: string
): Brand | null {
  if (!brand?.slug || !brand.name) return null;
  return {
    id: brand.documentId ?? String(brand.id ?? brand.slug),
    slug: brand.slug,
    name: brand.name,
    description: brand.description ?? undefined,
    country: brand.country ?? undefined,
    logo: mapMedia(brand.logo, base, brand.name) ?? undefined,
  };
}

export function mapNote(
  note: StrapiNote | null | undefined,
  base: string
): FragranceNote | null {
  if (!note?.slug || !note.name) return null;
  return {
    id: note.documentId ?? String(note.id ?? note.slug),
    slug: note.slug,
    name: note.name,
    description: note.description ?? undefined,
    image: mapMedia(note.image, base, note.name) ?? undefined,
  };
}

/**
 * Convertit un parfum Strapi. Retourne null si le parfum n'a ni slug, ni
 * marque exploitable, ni format — trois manques qui rendent la fiche
 * impossible à afficher.
 */
export function mapProduct(
  strapi: StrapiProduct,
  base: string
): Product | null {
  if (!strapi.slug || !strapi.name) return null;

  const brand = mapBrand(strapi.brand, base);
  if (!brand) return null;

  const gender: Gender = GENDERS.includes(strapi.gender as Gender)
    ? (strapi.gender as Gender)
    : 'unisexe';
  const family: FragranceFamily = FAMILIES.includes(strapi.family as FragranceFamily)
    ? (strapi.family as FragranceFamily)
    : 'floral';

  const notes: ProductNote[] = (strapi.notes ?? []).flatMap((entry) => {
    const note = mapNote(entry.note, base);
    if (!note) return [];
    const layer: NoteLayer = LAYERS.includes(entry.layer as NoteLayer)
      ? (entry.layer as NoteLayer)
      : 'heart';
    return [{ note, layer, position: entry.position ?? 0 }];
  });

  const variants: ProductVariant[] = (strapi.variants ?? [])
    .filter((v) => typeof v.price?.amount === 'number')
    .map((v, index) => ({
      id: v.sku ?? `${strapi.slug}-${index}`,
      volumeMl: v.volumeMl ?? 0,
      price: { amount: v.price!.amount!, currency: 'DZD' },
      compareAtPrice:
        typeof v.compareAtPrice?.amount === 'number'
          ? { amount: v.compareAtPrice.amount, currency: 'DZD' }
          : undefined,
      stock: v.stock ?? 0,
      sku: v.sku ?? undefined,
    }));

  // Un parfum sans aucun format vendable n'est pas affichable.
  if (variants.length === 0) return null;

  const images: Media[] = (strapi.images ?? [])
    .map((img) => mapMedia(img, base, `${strapi.name} — ${brand.name}`))
    .filter((m): m is Media => m !== null);

  return {
    id: strapi.documentId ?? String(strapi.id ?? strapi.slug),
    slug: strapi.slug,
    name: strapi.name,
    brand,
    description: strapi.description ?? '',
    story: strapi.story ?? undefined,
    gender,
    family,
    secondaryFamilies: keepKnown(strapi.secondaryFamilies, FAMILIES).filter(
      (f) => f !== family
    ),
    notes,
    variants,
    images,
    video: mapMedia(strapi.video, base, strapi.name) ?? undefined,
    concentration: strapi.concentration ?? undefined,
    longevityHours:
      typeof strapi.longevityHours === 'number' ? strapi.longevityHours : undefined,
    sillage:
      strapi.sillage && strapi.sillage >= 1 && strapi.sillage <= 5
        ? (strapi.sillage as 1 | 2 | 3 | 4 | 5)
        : undefined,
    seasons: keepKnown(strapi.seasons, SEASONS),
    occasions: keepKnown(strapi.occasions, OCCASIONS),
    // rating : jamais fourni par Strapi tant qu'il n'y a pas de vrai module
    // d'avis. Absent = rien affiché.
    badge: strapi.badge ?? undefined,
    featured: Boolean(strapi.featured),
    newArrival: Boolean(strapi.newArrival),
    bestseller: Boolean(strapi.bestseller),
    seo: mapSeo(strapi.seo, base),
  };
}

export function mapCollection(
  strapi: StrapiCollection,
  base: string
): Collection | null {
  if (!strapi.slug || !strapi.name) return null;
  return {
    id: strapi.documentId ?? String(strapi.id ?? strapi.slug),
    slug: strapi.slug,
    name: strapi.name,
    description: strapi.description ?? undefined,
    heroMedia: mapMedia(strapi.heroMedia, base, strapi.name) ?? undefined,
    theme: FAMILIES.includes(strapi.theme as FragranceFamily)
      ? (strapi.theme as string)
      : undefined,
    seo: mapSeo(strapi.seo, base),
  };
}
