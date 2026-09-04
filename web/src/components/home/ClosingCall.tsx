'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

/**
 * ══════════════════════════════════════════════════════════════
 *   CLÔTURE
 * ══════════════════════════════════════════════════════════════
 *
 * Dernier plan. Retour au noir profond du hero — la page se referme comme
 * elle s'est ouverte. Une phrase, un chemin principal (la collection), un
 * chemin secondaire pour ceux qui préfèrent être guidés (le diagnostic).
 * Rien de plus : ni formulaire, ni newsletter, ni promesse.
 */
export function ClosingCall({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  const c = dict.closing;

  return (
    <section
      ref={ref}
      aria-labelledby="cloture"
      className="relative overflow-hidden border-t border-smoke-2 bg-noir px-6 py-32 md:px-12 md:py-44 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 78%, rgba(200,155,60,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-(--container-site)">
        <h2 id="cloture" className="font-body font-light text-ivory">
          {c.lines.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(2.4rem,8vw,6.5rem)] leading-[1.03] tracking-[-0.02em]"
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div
          data-fade
          className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10"
        >
          <Link
            href={localePath(locale, '/parfums')}
            className="group relative inline-flex pb-1.5 font-ui text-2xs tracking-[0.22em] text-ivory uppercase"
          >
            {c.cta}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-gold transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
            />
          </Link>

          <Link
            href={localePath(locale, '/trouver')}
            className="font-ui text-2xs tracking-[0.14em] text-ivory/45 uppercase transition-colors hover:text-gold"
          >
            {c.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
