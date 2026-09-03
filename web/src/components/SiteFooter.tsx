import Link from 'next/link';

import { whatsappUrl } from '@/lib/whatsapp';

/**
 * Pied de page.
 *
 * Composant serveur. Volontairement sobre : liens de navigation, une entrée
 * conciergerie, mention légale. Les coordonnées physiques et l'e-mail de
 * l'ancien site ne sont pas repris ici tant qu'ils ne sont pas confirmés —
 * mieux vaut un pied de page court et juste qu'un pied de page complet et
 * approximatif.
 */
const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'La collection',
    links: [
      { href: '/parfums', label: 'Tous les parfums' },
      { href: '/parfums?genre=femme', label: 'Pour elle' },
      { href: '/parfums?genre=homme', label: 'Pour lui' },
      { href: '/trouver', label: 'Trouver votre parfum' },
    ],
  },
  {
    title: 'Familles olfactives',
    links: [
      { href: '/parfums?famille=floral', label: 'Floral' },
      { href: '/parfums?famille=woody', label: 'Boisé' },
      { href: '/parfums?famille=amber', label: 'Ambré' },
      { href: '/parfums?famille=fresh', label: 'Frais' },
    ],
  },
];

export function SiteFooter() {
  const conciergeUrl = whatsappUrl(
    'Bonjour Maison Dar Safia ✨\n\nJe souhaite un conseil personnalisé pour choisir un parfum.'
  );

  return (
    <footer className="border-t border-smoke-2 bg-noir-2">
      <div className="mx-auto max-w-(--container-site) px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))] md:gap-8">
          <div>
            <p className="font-display text-lg text-ivory">Dar Safia</p>
            <p className="mt-3 max-w-xs font-body text-md leading-relaxed text-ivory/55">
              Maison de haute parfumerie. Créations niche et signatures
              d&apos;exception, sélectionnées et livrées dans les 58 wilayas.
            </p>
            {conciergeUrl && (
              <a
                href={conciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-2xs tracking-(--tracking-label) text-gold uppercase transition-colors hover:text-gold-light"
              >
                Conciergerie WhatsApp
              </a>
            )}
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-3xs tracking-(--tracking-label) text-ivory/40 uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-md text-ivory/65 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-smoke-2 pt-6">
          <p className="text-3xs text-ivory/40">
            © {new Date().getFullYear()} Dar Safia. Tous droits réservés.
          </p>
          <p className="text-3xs text-ivory/40">
            Authenticité garantie · Paiement à la livraison
          </p>
        </div>
      </div>
    </footer>
  );
}
