'use client';

import { useMemo, useState } from 'react';

import type {
  Gender,
  IntensityTag,
  MoodTag,
  NoteTag,
  OlfactoryFamilyTag,
  SeasonTag,
} from '@/lib/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { pluralize } from '@/lib/i18n/dictionary';

import { FilterSidebar } from './FilterSidebar';
import { EMPTY_FILTERS, matchesFilters, toggleValue, type FilterCategory } from './filters';
import { PerfumeGrid } from './PerfumeGrid';
import type { ShopProduct } from './shop-product';

/**
 * ══════════════════════════════════════════════════════════════
 *   BOUTIQUE — FILTRAGE CLIENT
 * ══════════════════════════════════════════════════════════════
 *
 * Les 45 produits (forme réduite, cf. `shop-product.ts`) arrivent une fois
 * du serveur ; cocher un filtre ne renavigue plus — la grille se recalcule
 * en mémoire (`useMemo`). Étant client-side, la page redevient statique
 * (plus de `searchParams` côté serveur à lire).
 */
export function ShopExperience({
  products,
  locale,
  dict,
}: {
  products: ShopProduct[];
  locale: Locale;
  dict: Dictionary;
}) {
  const c = dict.catalog;
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filtered = useMemo(
    () => products.filter((p) => matchesFilters(p, filters)),
    [products, filters]
  );

  function handleToggle(category: FilterCategory, value: string) {
    setFilters((prev) => {
      switch (category) {
        case 'gender':
          return { ...prev, gender: toggleValue(prev.gender, value as Gender) };
        case 'family':
          return { ...prev, family: toggleValue(prev.family, value as OlfactoryFamilyTag) };
        case 'notes':
          return { ...prev, notes: toggleValue(prev.notes, value as NoteTag) };
        case 'intensity':
          return {
            ...prev,
            intensity: toggleValue(prev.intensity, Number(value) as IntensityTag),
          };
        case 'season':
          return { ...prev, season: toggleValue(prev.season, value as SeasonTag) };
        case 'mood':
          return { ...prev, mood: toggleValue(prev.mood, value as MoodTag) };
        default:
          return prev;
      }
    });
  }

  return (
    <div className="mt-10 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-12">
      <FilterSidebar
        filters={filters}
        onToggle={handleToggle}
        onClear={() => setFilters(EMPTY_FILTERS)}
        dict={dict}
      />

      <div>
        <p className="mt-6 text-2xs text-ivory/45 lg:mt-0" aria-live="polite">
          {pluralize(c.count, filtered.length)}
        </p>

        {filtered.length > 0 ? (
          <div className="mt-6">
            <PerfumeGrid products={filtered} locale={locale} dict={dict} />
          </div>
        ) : (
          <div className="mt-10 rounded-md border border-smoke-2 bg-noir-2 px-6 py-14 text-center">
            <p className="font-serif text-lg text-ivory">{c.empty}</p>
            <p className="mt-2 text-2xs text-ivory/50">{c.emptyHint}</p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-6 inline-block rounded-sm border border-gold px-5 py-2.5 text-2xs font-semibold tracking-(--tracking-label) text-gold uppercase transition-colors hover:bg-gold hover:text-noir"
            >
              {c.emptyCta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
