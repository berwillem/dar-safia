'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { FlaconScene } from '@/components/three/FlaconScene';
import { HouseFigures } from '@/components/home/HouseFigures';
import { useReveal } from '@/components/motion/useReveal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';
import { whatsappUrl } from '@/lib/whatsapp';

/**
 * ══════════════════════════════════════════════════════════════
 *   LA MAISON — L'EXPÉRIENCE
 * ══════════════════════════════════════════════════════════════
 *
 * Une page de parti pris, pas une notice « à propos » : ce qu'on garde,
 * pourquoi, et sur quels critères. Aucune histoire inventée — ni fondateur,
 * ni date, ni atelier tant qu'ils ne sont pas confirmés.
 *
 * Un seul moment « 3D », dans le hero : le flacon tourne, sa rotation
 * accrochée au défilement (`FlaconScene`). Le reste de la page se tient —
 * mêmes deux gestes que l'accueil (`useReveal`).
 */
export function AboutExperience({
  locale,
  dict,
  figures,
}: {
  locale: Locale;
  dict: Dictionary;
  figures: { creations: number; houses: number; wilayas: number };
}) {
  const a = dict.about;
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  // La déclaration du hero glissait par-dessus le flacon à la vitesse pleine
  // du défilement, pendant que le plan, lui, restait tenu : l'écart de vitesse
  // la faisait paraître aspirée vers le haut. Elle suit maintenant la page à
  // moindre allure — un plan plus lointain — et se dissout en perdant le net.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let teardown: (() => void) | null = null;
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const copy = root.querySelector<HTMLElement>('[data-hero-copy]');
      const track = root.querySelector<HTMLElement>('[data-scene-track]');
      if (!copy || !track) return;
      const tween = gsap.to(copy, {
        y: () => window.innerHeight * 0.32,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: '+=70%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      teardown = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();
    return () => {
      disposed = true;
      teardown?.();
    };
  }, []);

  const conciergeUrl = whatsappUrl(dict.common.conciergeMessage);

  return (
    <div ref={rootRef}>
      {/* ── Hero : le flacon + la déclaration ── */}
      {/* La piste de défilement du plan. Elle dure plus d'un écran : le canvas
          est collant et TIENT pendant que la page avance, ce qui laisse le
          temps de traverser les trois cadrages. Sans ce maintien, la caméra
          finissait sa course alors que le hero était déjà sorti par le haut.

          Surtout pas d'`overflow-hidden` sur la section : il en ferait son
          propre conteneur de défilement et le plan cesserait de coller. Le
          recadrage se fait dans le bloc intérieur. */}
      <section
        data-scene-track
        aria-labelledby="maison-titre"
        className="relative border-b border-smoke-2 bg-noir"
      >
        <div className="pointer-events-none sticky top-0 h-[92svh] overflow-hidden">
          <FlaconScene className="absolute inset-0" />

          {/* Le texte se pose dans la bande basse, sur un dégradé qui garde
              la lisibilité sans voiler le flacon. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                'linear-gradient(to top, var(--color-noir) 4%, rgba(26,18,15,0.72) 34%, transparent 100%)',
            }}
          />
        </div>

        {/* Remonté par-dessus le plan collant : la typographie occupe le premier
            écran, puis s'en va et libère le flacon seul. */}
        <div className="relative -mt-[92svh] flex min-h-[92svh] flex-col justify-end">
          <div
            data-hero-copy
            className="mx-auto w-full max-w-(--container-site) px-6 pb-16 md:px-12 md:pb-24 lg:px-20"
          >
            <p
              data-fade
              className="font-ui text-2xs tracking-(--tracking-eyebrow) text-gold uppercase"
            >
              {a.eyebrow}
            </p>

            <h1 id="maison-titre" className="mt-5 font-body font-light text-ivory">
              {a.title.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    data-rise
                    className="block text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.02em]"
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-fade
              className="mt-8 max-w-[46ch] font-body text-[clamp(1.15rem,1.7vw,1.45rem)] leading-[1.6] text-ivory/70"
            >
              {a.lead}
            </p>
          </div>
        </div>

        {/* La course qui reste : le flacon seul, sans un mot par-dessus. */}
        <div aria-hidden="true" className="h-[45svh] md:h-[80svh]" />

        <p className="sr-only">{a.sceneCaption}</p>
      </section>

      {/* ── Le parti pris ── */}
      <section
        aria-labelledby="parti-pris"
        className="border-b border-smoke-2 bg-noir px-6 py-28 md:px-12 md:py-40 lg:px-20"
      >
        <div className="mx-auto max-w-(--container-site)">
          <h2 id="parti-pris" className="font-body font-light text-ivory">
            <span className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] tracking-[-0.015em]"
              >
                {a.stanceTitle}
              </span>
            </span>
          </h2>

          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12">
            <p
              data-fade
              className="font-body text-[clamp(1.15rem,1.6vw,1.5rem)] leading-[1.62] text-ivory/72 md:col-span-7 md:col-start-6"
            >
              {a.stanceBody}
            </p>
            <p
              data-fade
              className="max-w-xs font-ui text-2xs leading-[1.9] text-ivory/40 md:col-span-4 md:col-start-6"
            >
              {a.stanceAside}
            </p>
          </div>
        </div>
      </section>

      {/* ── Les trois exigences ── */}
      <section
        aria-labelledby="exigences"
        className="border-b border-smoke-2 bg-noir-2 px-6 py-24 md:px-12 md:py-36 lg:px-20"
      >
        <div className="mx-auto max-w-(--container-site)">
          <h2 id="exigences" className="font-body font-light text-ivory/70">
            <span className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.15] tracking-[-0.01em]"
              >
                {a.requirementsTitle}
              </span>
            </span>
          </h2>

          <dl className="mt-14 md:mt-20">
            {a.requirements.map((req) => (
              <div
                key={req.term}
                data-fade
                className="grid gap-4 border-t border-gold/20 py-10 md:grid-cols-12 md:gap-10 md:py-12"
              >
                <dt className="font-body text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.2] text-ivory md:col-span-5">
                  {req.term}
                </dt>
                <dd className="font-body text-lg leading-[1.62] text-ivory/60 md:col-span-6 md:col-start-7">
                  {req.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── La maison en chiffres (composant partagé, données réelles) ── */}
      <HouseFigures
        creations={figures.creations}
        houses={figures.houses}
        wilayas={figures.wilayas}
        locale={locale}
        dict={dict}
      />

      {/* ── La conciergerie ── */}
      <section
        aria-labelledby="conciergerie"
        className="border-t border-smoke-2 bg-noir px-6 py-28 md:px-12 md:py-36 lg:px-20"
      >
        <div className="mx-auto max-w-(--container-site) md:grid md:grid-cols-12 md:gap-10">
          <h2 id="conciergerie" className="font-body font-light text-ivory md:col-span-5">
            <span className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(1.75rem,3.6vw,2.8rem)] leading-[1.1] tracking-[-0.015em]"
              >
                {a.conciergeTitle}
              </span>
            </span>
          </h2>

          <div className="mt-8 md:col-span-6 md:col-start-7 md:mt-0">
            <p
              data-fade
              className="font-body text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.62] text-ivory/70"
            >
              {a.conciergeBody}
            </p>

            {conciergeUrl && (
              <a
                data-fade
                href={conciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-8 inline-flex pb-1.5 font-ui text-2xs tracking-[0.2em] text-ivory uppercase"
              >
                {a.conciergeCta}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-gold transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
                />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Clôture ── */}
      <section
        aria-labelledby="maison-cloture"
        className="relative overflow-hidden bg-noir px-6 py-32 md:px-12 md:py-44 lg:px-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 50% 80%, rgba(200,155,60,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-(--container-site)">
          <h2 id="maison-cloture" className="font-body font-light text-ivory">
            {a.closingTitle.map((line) => (
              <span key={line} className="block overflow-hidden">
                <span
                  data-rise
                  className="block text-[clamp(2.4rem,7vw,6rem)] leading-[1.03] tracking-[-0.02em]"
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
              {a.closingCta}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-gold transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
              />
            </Link>
            <Link
              href={localePath(locale, '/trouver')}
              className="ds-navlink font-ui text-2xs tracking-[0.14em] text-ivory/45 uppercase transition-colors hover:text-gold"
            >
              {a.closingSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
