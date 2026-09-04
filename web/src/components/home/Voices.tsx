'use client';

import { useRef } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import { TESTIMONIALS } from '@/lib/home/testimonials';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * ══════════════════════════════════════════════════════════════
 *   CE QU'EN DISENT NOS CLIENTS
 * ══════════════════════════════════════════════════════════════
 *
 * Les quatre témoignages sont ceux repris de l'ancien site (src/lib/home/
 * testimonials.ts) : des mots de clients, pas de la copie d'interface, donc
 * non traduits. Aucun n'est inventé, et le composant n'en fabrique pas pour
 * « remplir » : s'il n'y en a pas, il ne s'affiche pas.
 *
 * Traitement éditorial : la citation d'abord, en grand ; l'attribution
 * ensuite, presque en retrait. Pas d'étoiles, pas de carte, pas de guillemets
 * décoratifs surdimensionnés.
 */
export function Voices({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  if (TESTIMONIALS.length === 0) return null;

  const v = dict.voices;

  return (
    <section
      ref={ref}
      aria-labelledby="temoignages"
      className="border-t border-smoke-2 bg-noir px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div className="mx-auto max-w-(--container-site)">
        <h2 id="temoignages" className="font-body font-light text-ivory/60">
          <span className="block overflow-hidden">
            <span
              data-rise
              className="block text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.15] tracking-[-0.01em]"
            >
              {v.title}
            </span>
          </span>
        </h2>

        <div className="mt-14 grid gap-x-12 gap-y-16 md:mt-20 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure key={`${t.name}-${t.city}`} data-fade className="flex flex-col">
              <blockquote className="font-body text-[clamp(1.3rem,2vw,1.7rem)] leading-[1.5] text-ivory/85">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 font-ui text-2xs tracking-[0.14em] text-ivory/45 uppercase">
                <span className="text-gold">{t.name}</span>
                <span aria-hidden="true" className="h-px w-6 bg-smoke-2" />
                <span>{t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
