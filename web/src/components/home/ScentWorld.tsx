'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { interpolate } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

export interface SignatureNote {
  slug: string;
  name: string;
  /** Nombre de créations du catalogue qui portent cette matière. */
  count: number;
}

/**
 * ══════════════════════════════════════════════════════════════
 *   LES MATIÈRES QUI REVIENNENT
 * ══════════════════════════════════════════════════════════════
 *
 * Pas d'ingrédients inventés : la liste est calculée sur le catalogue réel,
 * par fréquence d'apparition. Ce sont donc vraiment les matières de la
 * maison, et le chiffre en regard est vérifiable.
 *
 * La taille de chaque nom SUIT sa fréquence : la donnée devient la
 * composition. Rien n'est décoratif — la hiérarchie visuelle EST
 * l'information.
 */
export function ScentWorld({
  notes,
  productCount,
  locale,
  dict,
}: {
  notes: SignatureNote[];
  productCount: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, [notes.length]);

  const s = dict.scent;
  const max = Math.max(...notes.map((n) => n.count));
  const min = Math.min(...notes.map((n) => n.count));

  /** Fréquence -> corps de texte. La donnée pilote l'échelle. */
  const sizeFor = (count: number) => {
    const t = max === min ? 1 : (count - min) / (max - min);
    return 1.25 + t * 2.35; // rem
  };

  return (
    <section
      ref={ref}
      aria-labelledby="matieres"
      className="relative overflow-hidden border-t border-smoke-2 bg-noir-2 px-6 py-28 md:px-12 md:py-36 lg:px-20"
    >
      {/* Halo ambiant : une seule source lumineuse, très basse, qui rappelle
          la bougie du film sans imiter un effet. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 72% 18%, rgba(200,155,60,0.11) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-(--container-site)">
        <div className="grid gap-8 md:grid-cols-12">
          <h2
            id="matieres"
            className="font-body font-light text-ivory md:col-span-5"
          >
            <span className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.08] tracking-[-0.015em]"
              >
                {s.title}
              </span>
            </span>
          </h2>
          <p
            data-fade
            className="font-body text-lg leading-[1.65] text-ivory/60 md:col-span-5 md:col-start-8"
          >
            {interpolate(s.body, { count: productCount })}
          </p>
        </div>

        {/* Les matières. Le corps suit la fréquence ; la ligne de base
            commune tient l'ensemble malgré les tailles très différentes. */}
        <ul className="mt-20 flex flex-wrap items-baseline gap-x-8 gap-y-5 md:mt-28 md:gap-x-12">
          {notes.map((note) => (
            <li key={note.slug} data-fade className="group">
              <span
                className="font-body font-light text-ivory/85 transition-colors duration-500 group-hover:text-gold-light"
                style={{ fontSize: `${sizeFor(note.count)}rem`, lineHeight: 1.1 }}
              >
                {note.name}
              </span>
              <span className="ms-2 align-super font-ui text-3xs text-gold/60 tabular-nums">
                {note.count}
              </span>
            </li>
          ))}
        </ul>

        <div data-fade className="mt-16">
          <Link
            href={localePath(locale, '/parfums')}
            className="group relative inline-flex pb-1 font-ui text-2xs tracking-[0.2em] text-ivory/80 uppercase transition-colors hover:text-gold"
          >
            {s.explore}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-gold/60 transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
