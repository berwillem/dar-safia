/**
 * ══════════════════════════════════════════════════════════════
 *   FORMATAGE D'AFFICHAGE
 * ══════════════════════════════════════════════════════════════
 *
 * L'ancien catalogue stockait `priceFormatted: '23 500 DA'` à côté du montant :
 * deux sources pour une même donnée, et un formatage figé en français. Le
 * formatage appartient à l'affichage.
 *
 * - Les fonctions qui produisent du chiffre localisé prennent une `Locale`
 *   (Intl gère séparateurs, chiffres arabes, position du symbole).
 * - Les libellés (genre, famille, sillage, unités) viennent du dictionnaire :
 *   ces fonctions prennent donc un `Dictionary`.
 */

import type { Money } from './catalog/types';
import { BCP47, type Locale } from './i18n/config';
import { interpolate, type Dictionary } from './i18n/dictionary';

export type { Locale };

/**
 * Formate un montant. Le dinar algérien n'ayant pas d'usage courant des
 * subdivisions, aucune décimale.
 */
export function formatPrice(money: Money, locale: Locale = 'fr'): string {
  return new Intl.NumberFormat(BCP47[locale], {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(money.amount);
}

/** Contenance : 90 -> « 90 ml ». 0 = non applicable (coffret). */
export function formatVolume(
  volumeMl: number,
  locale: Locale,
  dict: Dictionary
): string {
  if (!volumeMl) return dict.units.set;
  const n = new Intl.NumberFormat(BCP47[locale]).format(volumeMl);
  return interpolate(dict.units.ml, { n });
}

/** Tenue : 48 -> « 48 h ». null si inconnue. */
export function formatLongevity(
  hours: number | undefined,
  dict: Dictionary
): string | null {
  return hours ? interpolate(dict.units.hours, { n: hours }) : null;
}

export function formatGender(gender: string, dict: Dictionary): string {
  return (dict.gender as Record<string, string>)[gender] ?? gender;
}

export function formatFamily(family: string, dict: Dictionary): string {
  return (dict.family as Record<string, string>)[family] ?? family;
}

/**
 * Sillage 1–5 en libellé. null si absent : afficher « Modéré » par défaut
 * affirmerait une mesure que l'on n'a pas.
 */
export function formatSillage(
  level: number | undefined,
  dict: Dictionary
): string | null {
  if (!level) return null;
  return (dict.sillage as Record<string, string>)[String(level)] ?? null;
}
