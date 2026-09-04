import 'server-only';

import type { Locale } from './config';
import type { Dictionary } from './dictionary';
import fr from './dictionaries/fr.json';

export type { Dictionary };
export { interpolate, pluralize } from './dictionary';

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  fr: async () => fr,
  ar: async () => (await import('./dictionaries/ar.json')).default as Dictionary,
  en: async () => (await import('./dictionaries/en.json')).default as Dictionary,
};

/** Charge le dictionnaire d'une langue. Server-only. */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
