'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import type { Locale } from '@/lib/i18n/config';
import { interpolate, pluralize, type Dictionary } from '@/lib/i18n/dictionary';

/**
 * Passe le dictionnaire et la langue aux composants CLIENT (panier, diagnostic,
 * bouton panier…). Les composants serveur, eux, appellent getDictionary
 * directement — ils n'ont pas besoin de ce contexte.
 *
 * Le dictionnaire est sérialisé une fois depuis le layout serveur ; il ne
 * change pas de valeur pendant la vie de la page.
 */

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
  /** Interpolation `{clé}`. */
  fill: (template: string, params?: Record<string, string | number>) => string;
  /** Pluralisation `"un|plusieurs"` selon count. */
  plural: (template: string, count: number, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const fill = useCallback(
    (template: string, params?: Record<string, string | number>) =>
      interpolate(template, params),
    []
  );
  const plural = useCallback(
    (template: string, count: number, params?: Record<string, string | number>) =>
      pluralize(template, count, params),
    []
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, dict, fill, plural }),
    [locale, dict, fill, plural]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n doit être utilisé dans un <I18nProvider>.');
  }
  return context;
}
