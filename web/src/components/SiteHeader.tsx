import Link from 'next/link';

import { CartButton } from './cart/CartButton';

/**
 * En-tête du site.
 *
 * Composant serveur : seul le bouton panier est un îlot client, parce que lui
 * seul dépend d'un état. La navigation reste du HTML pur.
 */
const NAV = [
  { href: '/parfums', label: 'Parfums' },
  { href: '/parfums?genre=femme', label: 'Pour Femme' },
  { href: '/parfums?genre=homme', label: 'Pour Homme' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-smoke-2 bg-noir/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-(--container-site) items-center gap-4 px-5 py-3.5 md:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-ivory transition-colors hover:text-gold"
        >
          Dar Safia
        </Link>

        <nav aria-label="Navigation principale" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-2xs tracking-(--tracking-label) text-ivory/70 uppercase transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto md:ml-0">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
