'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

import { NAV_STAGGER_START, useIntroPlays } from './home/intro-timing';
import { LocaleSwitcher } from './i18n/LocaleSwitcher';
import { CartButton } from './cart/CartButton';
import { usePrefersReducedMotion } from './motion/usePrefersReducedMotion';

/**
 * En-tête du site.
 *
 * Sur une page qui s'ouvre sur un plan plein écran, une barre opaque coupe
 * l'image dès la première seconde. L'en-tête reste donc transparent tant
 * qu'on est en haut, et ne prend son fond qu'une fois le film dépassé.
 * Le seuil vient de la hauteur de fenêtre, pas d'une valeur magique.
 *
 * Sur l'accueil, la nav entre en scène juste après la typographie du hero
 * (un demi-temps de retard : elle tombe sur un instant du plan plutôt que
 * sur le même mouvement). Les deux
 * composants ne se parlent pas directement : ils lisent le même minutage
 * partagé (`intro-timing.ts`), donc rien ne peut dériver entre eux. Sur les
 * autres pages, l'en-tête ne rejoue rien « parce qu'il est là » — il est
 * simplement posé, comme aujourd'hui.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === localePath(locale, '/');
  const wantsIntro = useIntroPlays();
  const reduced = usePrefersReducedMotion();

  // Le menu retient la page où il a été ouvert. Changer de page le referme
  // donc PENDANT le rendu, sans effet ni setState en cascade.
  const [menu, setMenu] = useState({ open: false, at: pathname });
  const menuOpen = menu.open && menu.at === pathname;
  const setMenuOpen = (open: boolean) => setMenu({ open, at: pathname });

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // setMenu est stable ; setMenuOpen serait recréé à chaque rendu.
      if (e.key === 'Escape') setMenu({ open: false, at: pathname });
    };
    document.addEventListener('keydown', onKey);
    // Le fond ne défile pas derrière le menu ouvert.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen, pathname]);

  /**
   * L'en-tête est en `z-40`, au-dessus du rideau du hero (`z-10`) : rien ne
   * le masque. Si son état de départ dépendait du chargement de GSAP (import
   * dynamique), la nav s'afficherait en clair le temps que le module arrive,
   * AVANT même que le rideau ne bouge — c'était le cas, et ça cassait
   * l'ouverture. L'état masqué est donc posé en CSS dès le rendu, de façon
   * synchrone : `usePathname` et `useSyncExternalStore` donnent leur valeur
   * pendant le rendu, avant la première peinture, et GSAP ne fait plus que
   * l'animer VERS l'état visible (`.to`, pas `.fromTo`).
   */
  const navHidden = isHome && !reduced;
  const hiddenStyle = navHidden
    ? { opacity: 0, transform: 'translateY(-16px) scale(0.97)' }
    : undefined;

  useEffect(() => {
    if (!navHidden) return;
    const root = barRef.current;
    if (!root) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      if (disposed) return;

      const delay = wantsIntro ? NAV_STAGGER_START.intro : NAV_STAGGER_START.repeat;
      const ctx = gsap.context(() => {
        gsap.to('[data-nav-item]', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          delay,
        });
      }, root);
      teardown = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [navHidden, wantsIntro]);

  // Reprend l'ordre du brief (Home, About, Parfums, Find My Match, Contact) :
  // les raccourcis « Pour elle / Pour lui » quittent la barre — ils restent
  // joignables depuis le filtre Genre de la boutique (partie B) — pour que
  // sept intitulés ne se pressent pas sur une largeur qui en tenait cinq.
  //
  // « About Dar Safia » n'a pas encore de page dédiée : le lien pointe sur
  // le manifeste de l'accueil plutôt que d'inventer une prose de présentation.
  const home = localePath(locale, '/');
  const nav = [
    { href: home, label: dict.nav.home },
    { href: `${home}#manifeste`, label: dict.nav.about },
    { href: localePath(locale, '/parfums'), label: dict.nav.perfumes },
    { href: localePath(locale, '/trouver'), label: dict.nav.scentFinder },
    { href: localePath(locale, '/contact'), label: dict.nav.contact },
  ];

  return (
    <header
      data-lifted={lifted || menuOpen || undefined}
      className="fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ease-(--ease-lux) data-lifted:border-b data-lifted:border-smoke-2 data-lifted:bg-noir/88 data-lifted:backdrop-blur-md"
    >
      <div
        ref={barRef}
        className="mx-auto flex max-w-(--container-site) items-center gap-4 px-5 py-4 md:px-8"
      >
        <Link
          href={home}
          data-nav-item
          style={hiddenStyle}
          className="shrink-0 font-serif text-lg whitespace-nowrap tracking-[0.08em] text-ivory transition-colors hover:text-gold"
        >
          {dict.common.brandName}
        </Link>

        <nav aria-label={dict.nav.perfumes} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map(({ href, label }) => (
              <li key={href} data-nav-item style={hiddenStyle}>
                <Link
                  href={href}
                  className="font-ui text-xs font-semibold whitespace-nowrap tracking-[0.14em] text-ivory/90 uppercase transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div data-nav-item style={hiddenStyle} className="ms-auto flex items-center gap-1 lg:ms-0">
          <LocaleSwitcher current={locale} label={dict.nav.language} />
          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            className="rounded-xs p-2 text-ivory/80 transition-colors hover:text-gold lg:hidden"
          >
            {/* Deux traits qui se croisent : le geste dit ce qu'il fait. */}
            <span aria-hidden="true" className="relative block h-3.5 w-5">
              <span
                className="absolute inset-x-0 top-0.5 h-px bg-current transition-transform duration-300 ease-(--ease-lux)"
                style={menuOpen ? { transform: 'translateY(6px) rotate(45deg)' } : undefined}
              />
              <span
                className="absolute inset-x-0 bottom-0.5 h-px bg-current transition-transform duration-300 ease-(--ease-lux)"
                style={menuOpen ? { transform: 'translateY(-6px) rotate(-45deg)' } : undefined}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ── Menu mobile ── */}
      <div
        id="menu-principal"
        ref={panelRef}
        hidden={!menuOpen}
        className="border-t border-smoke-2 bg-noir/97 backdrop-blur-md lg:hidden"
      >
        <nav aria-label={dict.nav.perfumes}>
          <ul className="flex flex-col px-5 py-4 md:px-8">
            {nav.map(({ href, label }) => (
              <li key={href} className="border-b border-smoke-2 last:border-b-0">
                <Link
                  href={href}
                  className="block py-4 font-body text-2xl text-ivory transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
