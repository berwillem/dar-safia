'use client';

import { useRef } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * ══════════════════════════════════════════════════════════════
 *   MANIFESTE
 * ══════════════════════════════════════════════════════════════
 *
 * Un moment éditorial, pas une section « À propos ». La déclaration occupe
 * seule la largeur ; le texte d'appui est décalé, en colonne étroite, sous la
 * mesure de lecture. Le contraste d'échelle fait tout le travail — il n'y a
 * ni carte, ni icône, ni encadré.
 */
export function Manifesto({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  const m = dict.manifesto;

  return (
    <section
      ref={ref}
      aria-labelledby="manifeste"
      className="relative border-t border-smoke-2 bg-noir px-6 py-28 md:px-12 md:py-40 lg:px-20"
    >
      <div className="mx-auto max-w-(--container-site)">
        <h2 id="manifeste" className="font-body font-light text-ivory">
          {m.lines.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(2.4rem,8vw,7rem)] leading-[1.02] tracking-[-0.02em]"
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        {/* Le corps de texte est décalé vers la droite et tenu court :
            il commente la déclaration, il ne la répète pas. */}
        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <p
            data-fade
            className="font-body text-[clamp(1.15rem,1.6vw,1.5rem)] leading-[1.6] text-ivory/70 md:col-span-6 md:col-start-6"
          >
            {m.body}
          </p>
          <p
            data-fade
            className="max-w-xs font-ui text-2xs leading-[1.9] text-ivory/40 md:col-span-3 md:col-start-6 lg:col-start-6"
          >
            {m.aside}
          </p>
        </div>
      </div>
    </section>
  );
}
