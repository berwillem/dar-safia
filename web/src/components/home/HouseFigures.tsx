'use client';

import { useRef } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import { BCP47, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * ══════════════════════════════════════════════════════════════
 *   LA MAISON EN CHIFFRES
 * ══════════════════════════════════════════════════════════════
 *
 * Trois chiffres, tous vérifiables : le nombre de créations et de maisons
 * vient du catalogue (passé en props par la page, composant serveur), les
 * 58 wilayas sont le périmètre de livraison affiché partout sur le site.
 * Aucune statistique inventée — pas de « clients satisfaits », pas d'années
 * d'existence.
 *
 * Le chiffre domine, le libellé se tient en dessous, discret. Pas d'icône.
 */
export function HouseFigures({
  creations,
  houses,
  wilayas,
  locale,
  dict,
}: {
  creations: number;
  houses: number;
  wilayas: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, [creations, houses, wilayas]);

  const f = dict.figures;
  const nf = new Intl.NumberFormat(BCP47[locale]);

  const rows = [
    { value: creations, label: f.creations },
    { value: houses, label: f.houses },
    { value: wilayas, label: f.wilayas },
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="chiffres"
      className="border-t border-smoke-2 bg-noir-2 px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div className="mx-auto max-w-(--container-site)">
        <h2
          id="chiffres"
          className="font-body font-light text-ivory/70"
        >
          <span className="block overflow-hidden">
            <span
              data-rise
              className="block text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.15] tracking-[-0.01em]"
            >
              {f.title}
            </span>
          </span>
        </h2>

        <dl className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-3 md:mt-20">
          {rows.map((row) => (
            <div key={row.label} data-fade className="border-t border-gold/25 pt-6">
              <dd className="font-body font-light text-ivory tabular-nums">
                <span className="block text-[clamp(3rem,7vw,5.5rem)] leading-none">
                  {nf.format(row.value)}
                </span>
              </dd>
              <dt className="mt-4 max-w-[16ch] font-ui text-2xs leading-[1.7] tracking-[0.08em] text-ivory/45">
                {row.label}
              </dt>
            </div>
          ))}
        </dl>

        <p data-fade className="mt-14 font-ui text-3xs tracking-[0.06em] text-ivory/30">
          {f.note}
        </p>
      </div>
    </section>
  );
}
