'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

import { LocaleSwitcher } from './i18n/LocaleSwitcher';
import { CartButton } from './cart/CartButton';
import { INTRO_ATTR } from '@/lib/intro-guard';

import { INTRO_DONE_EVENT, introWillPlay, NAV_REVEAL } from './home/intro-timing';

/**
 * Au chargement complet, le voile est DÉJÀ posé par le script du <head>. Cet
 * effet fait le reste : le réappliquer (le Strict Mode de développement efface
 * les attributs de <html>), le poser lors d'une navigation client vers
 * l'accueil, et surtout le LEVER. `useLayoutEffect` pour agir avant la
 * peinture ; `useEffect` côté serveur, où il ne s'exécute jamais.
 */
const useVeilEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * En-tête du site — présent, identique, sur TOUTES les pages.
 *
 * Une seule différence selon la page : le fond. L'accueil s'ouvre sur un plan
 * plein écran ; une barre opaque le couperait dès la première seconde, donc
 * là — et là seulement — l'en-tête reste transparent tant qu'on est en haut
 * et ne prend son fond qu'une fois le film dépassé (seuil = hauteur de
 * fenêtre). Partout ailleurs, le fond est là dès le premier rendu.
 *
 * Une seule exception à « la nav est toujours là » : le film d'ouverture de
 * l'accueil, à la première visite de la session. L'en-tête est en `z-40`,
 * donc au-dessus du rideau (`z-10`) — il se posait par-dessus la mise en
 * scène avant qu'elle n'ait commencé. Il est donc VOILÉ le temps du film et
 * arrive une fois le plan installé (`NAV_REVEAL`).
 *
 * Trois sorties de secours, pour qu'aucune nav ne soit jamais vraiment
 * absente : la fin du minutage, le bouton « passer » (`INTRO_DONE_EVENT`) et
 * la première tabulation — personne au clavier n'attend six secondes.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === localePath(locale, '/');

  useVeilEffect(() => {
    const root = document.documentElement;
    // `window.__dsIntro` d'abord : posé une fois, il survit au remontage. Le
    // sessionStorage, lui, est marqué « vu » par `HeroFilm` dès son montage —
    // le relire en pleine intro répondrait faux et laisserait l'en-tête voilé.
    const veil = isHome && (window.__dsIntro === 1 || introWillPlay());
    if (!veil) {
      window.__dsIntro = 0;
      root.removeAttribute(INTRO_ATTR);
      return;
    }
    window.__dsIntro = 1;
    root.setAttribute(INTRO_ATTR, 'playing');

    const lift = () => {
      window.__dsIntro = 0;
      root.removeAttribute(INTRO_ATTR);
    };
    const timer = window.setTimeout(lift, NAV_REVEAL * 1000);
    window.addEventListener(INTRO_DONE_EVENT, lift);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') lift();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(INTRO_DONE_EVENT, lift);
      window.removeEventListener('keydown', onKey);
    };
  }, [isHome]);

  // Le menu retient la page où il a été ouvert. Changer de page le referme
  // donc PENDANT le rendu, sans effet ni setState en cascade.
  const [menu, setMenu] = useState({ open: false, at: pathname });
  const menuOpen = menu.open && menu.at === pathname;
  const setMenuOpen = (open: boolean) => setMenu({ open, at: pathname });

  // Le seuil de défilement ne concerne que l'accueil ; ailleurs, le fond est
  // là dès le premier rendu.
  const solidHeader = !isHome || lifted || menuOpen;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

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

  const home = localePath(locale, '/');
  const nav = [
    { href: home, label: dict.nav.home },
    { href: localePath(locale, '/la-maison'), label: dict.nav.about },
    { href: localePath(locale, '/parfums'), label: dict.nav.perfumes },
    { href: localePath(locale, '/trouver'), label: dict.nav.scentFinder },
    { href: localePath(locale, '/contact'), label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    href === home ? pathname === home : pathname.startsWith(href.split('?')[0]);

  return (
    <header
      data-lifted={solidHeader || undefined}
      className="ds-header fixed inset-x-0 top-0 z-40 data-lifted:border-b data-lifted:border-smoke-2 data-lifted:bg-noir/88 data-lifted:backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-(--container-site) items-center gap-4 px-5 py-4 md:px-8">
        <Link
          href={home}
          className="shrink-0 font-serif text-lg whitespace-nowrap tracking-[0.08em] text-ivory transition-colors hover:text-gold"
        >
          {dict.common.brandName}
        </Link>

        <nav aria-label={dict.nav.perfumes} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className="ds-navlink font-ui text-xs font-semibold whitespace-nowrap tracking-[0.14em] text-ivory/90 uppercase transition-colors hover:text-gold aria-[current=page]:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
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
                  aria-current={isActive(href) ? 'page' : undefined}
                  className="block py-4 font-body text-2xl text-ivory transition-colors hover:text-gold aria-[current=page]:text-gold"
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
