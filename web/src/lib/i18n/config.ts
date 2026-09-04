/**
 * ══════════════════════════════════════════════════════════════
 *   I18N — CONFIGURATION
 * ══════════════════════════════════════════════════════════════
 *
 * Trois langues : français (défaut), arabe (RTL), anglais.
 * Le français est la langue d'origine du contenu ; l'arabe et l'anglais
 * sont traduits et destinés à être affinés.
 */

export const LOCALES = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

/** Sens de lecture par langue. Pilote l'attribut `dir` du <html>. */
export const DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  ar: 'rtl',
  en: 'ltr',
};

/** Nom natif de chaque langue, pour le sélecteur. */
export const LOCALE_LABEL: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

/** Balise BCP 47 régionale, pour Intl (formatage nombres / devises). */
export const BCP47: Record<Locale, string> = {
  fr: 'fr-DZ',
  ar: 'ar-DZ',
  en: 'en-DZ',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
