'use client';

import { useEffect, useRef, useState } from 'react';

import {
  INTENSITY_TAGS,
  MOOD_TAGS,
  NOTE_TAGS,
  OLFACTORY_FAMILY_TAGS,
  SEASON_TAGS,
  type IntensityTag,
  type MoodTag,
  type NoteTag,
  type OlfactoryFamilyTag,
  type SeasonTag,
} from '@/lib/catalog';
import { formatGender, formatSillage } from '@/lib/format';
import type { Dictionary } from '@/lib/i18n/dictionary';

import { GENDERS } from './shop-product';
import { hasActiveFilters, type FilterCategory, type ShopFilters } from './filters';

/**
 * ══════════════════════════════════════════════════════════════
 *   FILTRES — ACCORDÉON + TIROIR MOBILE
 * ══════════════════════════════════════════════════════════════
 *
 * L'ouverture/fermeture est en CSS pur (`grid-template-rows` 0fr/1fr),
 * pas en GSAP : c'est déjà ce que fait `SiteHeader` pour son menu mobile, et
 * `prefers-reduced-motion` est déjà géré une fois pour toutes dans
 * globals.css (les transitions y tombent à 0,01 ms). Pas de mécanisme
 * supplémentaire à maintenir pour un simple accordéon.
 *
 * Le tiroir mobile reprend le `<dialog>` natif de `CartDrawer` (piégeage du
 * focus et inertie du fond fournis par le navigateur) plutôt que d'inventer
 * un second système de tiroir.
 */
export function FilterSidebar({
  filters,
  onToggle,
  onClear,
  dict,
}: {
  filters: ShopFilters;
  onToggle: (category: FilterCategory, value: string) => void;
  onClear: () => void;
  dict: Dictionary;
}) {
  const f = dict.catalog.filters;
  const [openCategories, setOpenCategories] = useState<Set<FilterCategory>>(
    () => new Set(['gender'])
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    else if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setDrawerOpen(false);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  function toggleCategory(key: FilterCategory) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const categories: {
    key: FilterCategory;
    legend: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      key: 'gender',
      legend: f.gender,
      options: GENDERS.map((g) => ({ value: g, label: formatGender(g, dict) })),
    },
    {
      key: 'family',
      legend: f.family,
      options: OLFACTORY_FAMILY_TAGS.map((tag: OlfactoryFamilyTag) => ({
        value: tag,
        label: f.familyOptions[tag],
      })),
    },
    {
      key: 'notes',
      legend: f.notes,
      options: NOTE_TAGS.map((tag: NoteTag) => ({ value: tag, label: f.noteOptions[tag] })),
    },
    {
      key: 'intensity',
      legend: f.intensity,
      options: INTENSITY_TAGS.map((tag: IntensityTag) => ({
        value: String(tag),
        label: formatSillage(tag, dict) ?? String(tag),
      })),
    },
    {
      key: 'season',
      legend: f.season,
      options: SEASON_TAGS.map((tag: SeasonTag) => ({ value: tag, label: f.seasonOptions[tag] })),
    },
    {
      key: 'mood',
      legend: f.mood,
      options: MOOD_TAGS.map((tag: MoodTag) => ({ value: tag, label: f.moodOptions[tag] })),
    },
  ];

  const content = (
    <div className="flex flex-col">
      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={onClear}
          className="self-start pb-4 font-ui text-2xs tracking-(--tracking-label) text-gold uppercase transition-colors hover:text-gold-light"
        >
          {f.clear}
        </button>
      )}
      {categories.map((category) => {
        const isOpen = openCategories.has(category.key);
        const selected = filters[category.key] as string[];
        return (
          <div key={category.key} className="border-t border-smoke-2">
            <button
              type="button"
              onClick={() => toggleCategory(category.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-3.5 text-start font-ui text-2xs tracking-(--tracking-label) text-ivory uppercase"
            >
              <span className="flex items-center gap-2">
                {category.legend}
                {selected.length > 0 && (
                  <span className="rounded-full bg-gold px-1.5 py-0.5 text-3xs font-semibold text-noir tabular-nums">
                    {selected.length}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className="text-ivory/50 transition-transform duration-300 ease-(--ease-lux)"
                style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
              >
                ⌄
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-500 ease-(--ease-lux)"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col gap-2.5 pb-4">
                  {category.options.map((option) => (
                    <li key={option.value}>
                      <label className="flex items-center gap-2.5 font-body text-md text-ivory/75">
                        <input
                          type="checkbox"
                          checked={selected.includes(option.value)}
                          onChange={() => onToggle(category.key, option.value)}
                          className="h-4 w-4 shrink-0 accent-gold"
                        />
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ── Colonne fixe, à partir de lg ── */}
      <aside aria-label={f.openButton} className="hidden lg:block">
        {content}
      </aside>

      {/* ── Déclencheur + tiroir, en dessous de lg ── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm border border-smoke-2 px-4 py-2.5 font-ui text-2xs tracking-(--tracking-label) text-ivory uppercase transition-colors hover:border-gold/50"
        >
          {f.openButton}
          {hasActiveFilters(filters) && (
            <span className="rounded-full bg-gold px-1.5 py-0.5 text-3xs font-semibold text-noir tabular-nums">
              {Object.values(filters).reduce((n, v) => n + v.length, 0)}
            </span>
          )}
        </button>

        <dialog
          ref={dialogRef}
          aria-label={f.openButton}
          onClick={(event) => {
            if (event.target === dialogRef.current) setDrawerOpen(false);
          }}
          className="m-0 ms-auto h-dvh max-h-dvh w-full max-w-sm bg-noir-2 p-0 text-ivory backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        >
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-smoke-2 px-5 py-4">
              <h2 className="font-serif text-lg text-ivory">{f.openButton}</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={f.close}
                className="rounded-xs p-1.5 text-ivory/60 transition-colors hover:text-ivory"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-2">{content}</div>
          </div>
        </dialog>
      </div>
    </>
  );
}
