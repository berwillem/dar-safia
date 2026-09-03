/**
 * ══════════════════════════════════════════════════════════════
 *   FORMATAGE D'AFFICHAGE
 * ══════════════════════════════════════════════════════════════
 *
 * L'ancien catalogue stockait `priceFormatted: '23 500 DA'` à côté du montant
 * numérique : deux sources pour une même donnée, et un formatage figé en
 * français impossible à traduire. Le formatage appartient à l'affichage.
 *
 * Ces fonctions prennent une locale afin que le passage à l'arabe et à
 * l'anglais (phase 4) ne demande aucune réécriture.
 */

import type { Money } from './catalog/types';

export type Locale = 'fr' | 'ar' | 'en';

/** Correspondance locale applicative -> balise BCP 47 régionale. */
const BCP47: Record<Locale, string> = {
  fr: 'fr-DZ',
  ar: 'ar-DZ',
  en: 'en-DZ',
};

/**
 * Formate un montant. Le dinar algérien n'ayant pas d'usage courant des
 * subdivisions, on n'affiche aucune décimale.
 *
 * Intl gère l'espace insécable et, en arabe, les chiffres et la position du
 * symbole — ce qu'une concaténation manuelle ne ferait pas.
 */
export function formatPrice(money: Money, locale: Locale = 'fr'): string {
  return new Intl.NumberFormat(BCP47[locale], {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(money.amount);
}

/** Contenance : 90 -> « 90 ml ». 0 signifie « non applicable » (coffret). */
export function formatVolume(volumeMl: number, locale: Locale = 'fr'): string {
  if (!volumeMl) return locale === 'fr' ? 'Coffret' : 'Set';
  return `${new Intl.NumberFormat(BCP47[locale]).format(volumeMl)} ml`;
}

/** Tenue : 48 -> « 48 h ». */
export function formatLongevity(hours: number | undefined): string | null {
  return hours ? `${hours} h` : null;
}

const GENDER_LABELS: Record<string, Record<Locale, string>> = {
  femme: { fr: 'Pour Femme', ar: 'للنساء', en: 'For Her' },
  homme: { fr: 'Pour Homme', ar: 'للرجال', en: 'For Him' },
  unisexe: { fr: 'Unisexe', ar: 'للجنسين', en: 'Unisex' },
};

export function formatGender(gender: string, locale: Locale = 'fr'): string {
  return GENDER_LABELS[gender]?.[locale] ?? gender;
}

const FAMILY_LABELS: Record<string, Record<Locale, string>> = {
  floral: { fr: 'Floral', ar: 'زهري', en: 'Floral' },
  amber: { fr: 'Ambré', ar: 'عنبري', en: 'Amber' },
  woody: { fr: 'Boisé', ar: 'خشبي', en: 'Woody' },
  fresh: { fr: 'Frais', ar: 'منعش', en: 'Fresh' },
  gourmand: { fr: 'Gourmand', ar: 'حلو', en: 'Gourmand' },
  spicy: { fr: 'Épicé', ar: 'حار', en: 'Spicy' },
};

export function formatFamily(family: string, locale: Locale = 'fr'): string {
  return FAMILY_LABELS[family]?.[locale] ?? family;
}

/** Sillage 1–5 en libellé. */
const SILLAGE_LABELS: Record<number, string> = {
  1: 'Intime',
  2: 'Discret',
  3: 'Modéré',
  4: 'Affirmé',
  5: 'Puissant',
};

export function formatSillage(level: number): string {
  return SILLAGE_LABELS[level] ?? SILLAGE_LABELS[3];
}
