'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import { formatFamily, formatPrice } from '@/lib/format';
import type { SignatureProduct } from '@/lib/home/signatures';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { interpolate } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

/**
 * ══════════════════════════════════════════════════════════════
 *   LES SIGNATURES — LA SÉQUENCE
 * ══════════════════════════════════════════════════════════════
 *
 * Le seul moment « wow » de la page, et le seul endroit où l'on dépense de
 * l'audace. Pas une grille : une scène qui se fige pendant qu'on la traverse,
 * un parfum à la fois, et c'est la COULEUR de toute la scène qui bascule vers
 * l'univers olfactif de chaque flacon (data-universe -> tokens du thème).
 * Rien d'autre ne bouge : le reste de la page reste silencieux.
 *
 * L'image des familles est volontairement très en retrait — ce ne sont pas
 * des photos de flacons, seulement une matière de fond. La typographie et la
 * lumière portent la scène.
 *
 * Sous prefers-reduced-motion : pas d'épinglage, pas d'empilement. Une liste
 * éditoriale verticale, chaque signature à sa place, lisible immédiatement.
 */

const noSubscribe = () => () => {};
const readReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SignatureStage({
  products,
  locale,
  dict,
}: {
  products: SignatureProduct[];
  locale: Locale;
  dict: Dictionary;
}) {
  const reduced = useSyncExternalStore(noSubscribe, readReduced, () => false);
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useReveal(sectionRef);

  useEffect(() => {
    if (reduced || products.length < 2) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    // `position: sticky` fait l'épinglage nativement. Pour la progression, on
    // s'appuie sur ScrollTrigger — déjà chargé par le site (SmoothScroll,
    // useReveal), et le seul à lire correctement la position quand Lenis pilote
    // le défilement (il n'émet pas d'évènement `scroll` natif). On ne lui
    // demande qu'un `onUpdate` : l'épinglage reste au CSS.
    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (disposed || !wrapRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const count = products.length;
      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(count - 1, Math.floor(self.progress * count));
          setActive((prev) => (prev === i ? prev : i));
        },
      });
      // Les polices web décalent la hauteur du hero au-dessus : on remesure une
      // fois tout posé, sinon `end` reste calé sur une mise en page périmée.
      ScrollTrigger.refresh();
      teardown = () => st.kill();
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [reduced, products.length]);

  const s = dict.signature;

  if (products.length === 0) return null;

  const heading = (
    <div className="flex items-baseline justify-between gap-6">
      <h2 id="signatures" className="font-body font-light text-ivory">
        <span className="block overflow-hidden">
          <span
            data-rise
            className="block text-[clamp(1.75rem,3.6vw,2.8rem)] leading-[1.1] tracking-[-0.015em]"
          >
            {s.title}
          </span>
        </span>
      </h2>
      <p
        data-fade
        className="shrink-0 font-ui text-2xs tracking-[0.24em] text-gold/70 uppercase"
      >
        {s.intro}
      </p>
    </div>
  );

  // ── Mode réduit : liste éditoriale ──
  if (reduced) {
    return (
      <section
        ref={sectionRef}
        aria-labelledby="signatures"
        className="border-t border-smoke-2 bg-noir px-6 py-24 md:px-12 md:py-28 lg:px-20"
      >
        <div className="mx-auto max-w-(--container-site)">
          {heading}
          <ol className="mt-8">
            {products.map((product, i) => (
              <li
                key={product.slug}
                data-universe={product.family}
                data-fade
                className="border-t border-smoke-2 py-14 md:py-16"
              >
                <PanelBody
                  product={product}
                  index={i}
                  total={products.length}
                  locale={locale}
                  dict={dict}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  // ── Mode complet : la scène épinglée ──
  const current = products[active];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="signatures"
      className="relative border-t border-smoke-2 bg-noir"
    >
      <div ref={wrapRef} style={{ height: `${products.length * 100}vh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* Couches d'univers empilées : une par famille, seule l'active
              est visible. La couleur est la seule chose qui bascule. */}
          {products.map((product, i) => (
            <div
              key={product.slug}
              data-universe={product.family}
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-[900ms] ease-(--ease-lux)"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              {product.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image.url}
                  srcSet={product.image.srcset ?? undefined}
                  sizes="100vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.13]"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(65% 55% at 50% 32%, var(--universe-glow) 0%, transparent 72%)',
                }}
              />
              <div className="absolute inset-0 bg-noir/45" />
            </div>
          ))}

          {/* Contenu. `data-universe` de l'actif : compteur, filet et lien
              suivent la couleur de l'univers courant. */}
          <div
            data-universe={current.family}
            className="relative mx-auto flex h-full max-w-(--container-site) flex-col justify-between px-6 py-16 md:px-12 md:py-20 lg:px-20"
          >
            {heading}

            <div className="relative flex-1 py-10">
              {products.map((product, i) => (
                <div
                  key={product.slug}
                  aria-hidden={i !== active}
                  className="absolute inset-0 flex flex-col justify-center transition-opacity duration-500 ease-(--ease-lux)"
                  style={{
                    opacity: i === active ? 1 : 0,
                    pointerEvents: i === active ? undefined : 'none',
                  }}
                >
                  <PanelBody
                    product={product}
                    index={i}
                    total={products.length}
                    locale={locale}
                    dict={dict}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-5">
              <span className="font-ui text-2xs tracking-[0.22em] text-ivory/45 tabular-nums">
                {interpolate(s.of, {
                  current: active + 1,
                  total: products.length,
                })}
              </span>
              <span
                aria-hidden="true"
                className="relative h-px flex-1 overflow-hidden bg-smoke-2"
              >
                <span
                  className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--universe-accent)] transition-transform duration-[900ms] ease-(--ease-lux)"
                  style={{
                    transform: `scaleX(${(active + 1) / products.length})`,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelBody({
  product,
  index,
  total,
  locale,
  dict,
}: {
  product: SignatureProduct;
  index: number;
  total: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const s = dict.signature;
  return (
    <div className="max-w-3xl">
      <p className="flex items-center gap-3 font-ui text-2xs tracking-[0.24em] text-gold uppercase">
        {product.brand}
        <span className="text-ivory/30 tabular-nums">
          {String(index + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
        </span>
      </p>

      <p className="mt-5 font-body font-light text-ivory">
        <span className="block text-[clamp(2.3rem,6.4vw,5rem)] leading-[1.02] tracking-[-0.02em]">
          {product.name}
        </span>
      </p>

      <p className="mt-5 font-body text-lg text-ivory/55">
        {formatFamily(product.family, dict)}
        <span className="mx-3 text-ivory/25">·</span>
        {formatPrice({ amount: product.priceFrom, currency: 'DZD' }, locale)}
      </p>

      <Link
        href={localePath(locale, `/parfums/${product.slug}`)}
        className="group relative mt-8 inline-flex pb-1 font-ui text-2xs tracking-[0.2em] text-ivory/85 uppercase transition-colors hover:text-[var(--universe-light)]"
      >
        {s.discover}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-[var(--universe-accent)] transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
        />
      </Link>
    </div>
  );
}
