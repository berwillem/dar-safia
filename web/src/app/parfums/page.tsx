import type { Metadata } from 'next';
import Link from 'next/link';

import { ProductCard } from '@/components/ProductCard';
import { catalog, type FragranceFamily, type Gender } from '@/lib/catalog';
import { formatFamily, formatGender } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Tous les parfums',
  description:
    "L'intégralité de la collection Dar Safia : parfums niche et signatures d'exception.",
};

/**
 * Catalogue.
 *
 * Le filtrage passe par l'URL (?genre=femme&famille=woody) plutôt que par un
 * état client : chaque combinaison devient une page partageable et indexable,
 * et la page reste un composant serveur sans JavaScript.
 */
type PageProps = {
  searchParams: Promise<{ genre?: string; famille?: string }>;
};

const GENDERS: Gender[] = ['femme', 'homme', 'unisexe'];
const FAMILIES: FragranceFamily[] = [
  'floral', 'amber', 'woody', 'fresh', 'gourmand', 'spicy',
];

/** Construit une URL de filtre en préservant l'autre critère. */
function filterHref(
  current: { genre?: string; famille?: string },
  key: 'genre' | 'famille',
  value: string | null
): string {
  const next = { ...current, [key]: value ?? undefined };
  const query = new URLSearchParams();
  if (next.genre) query.set('genre', next.genre);
  if (next.famille) query.set('famille', next.famille);
  const suffix = query.toString();
  return suffix ? `/parfums?${suffix}` : '/parfums';
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const filters = await searchParams;

  // Les valeurs d'URL sont des saisies utilisateur : on ne retient que
  // celles du vocabulaire connu, plutôt que de les passer telles quelles.
  const gender = GENDERS.includes(filters.genre as Gender)
    ? (filters.genre as Gender)
    : undefined;
  const family = FAMILIES.includes(filters.famille as FragranceFamily)
    ? (filters.famille as FragranceFamily)
    : undefined;

  const { items, total } = await catalog.listProducts({
    gender,
    family,
    sort: 'name',
  });

  const active = { genre: gender, famille: family };

  return (
    <main id="contenu" tabIndex={-1} className="mx-auto max-w-(--container-site) px-5 py-14 md:px-8">
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        Catalogue
      </p>
      <h1 className="mt-4 font-serif text-display-md text-balance text-ivory">
        Tous les parfums
      </h1>

      {/* ── Filtres ── */}
      <div className="mt-10 flex flex-col gap-4 border-y border-smoke-2 py-5">
        <FilterRow
          legend="Genre"
          options={GENDERS.map((g) => ({ value: g, label: formatGender(g) }))}
          activeValue={gender}
          hrefFor={(value) => filterHref(active, 'genre', value)}
        />
        <FilterRow
          legend="Famille"
          options={FAMILIES.map((f) => ({ value: f, label: formatFamily(f) }))}
          activeValue={family}
          hrefFor={(value) => filterHref(active, 'famille', value)}
        />
      </div>

      <p className="mt-6 text-2xs text-ivory/45" aria-live="polite">
        {total} {total > 1 ? 'créations' : 'création'}
      </p>

      {items.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        /* État vide : une combinaison de filtres peut ne rien donner
           (« spicy » n'a aucun parfum au catalogue actuel). */
        <div className="mt-10 rounded-md border border-smoke-2 bg-noir-2 px-6 py-14 text-center">
          <p className="font-serif text-lg text-ivory">Aucun parfum ne correspond</p>
          <p className="mt-2 text-2xs text-ivory/50">
            Essayez une autre famille olfactive.
          </p>
          <Link
            href="/parfums"
            className="mt-6 inline-block rounded-sm border border-gold px-5 py-2.5 text-2xs font-semibold tracking-(--tracking-label) text-gold uppercase transition-colors hover:bg-gold hover:text-noir"
          >
            Voir toute la collection
          </Link>
        </div>
      )}
    </main>
  );
}

function FilterRow({
  legend,
  options,
  activeValue,
  hrefFor,
}: {
  legend: string;
  options: { value: string; label: string }[];
  activeValue: string | undefined;
  hrefFor: (value: string | null) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-3xs tracking-(--tracking-label) text-ivory/40 uppercase">
        {legend}
      </span>

      <Link
        href={hrefFor(null)}
        aria-current={activeValue === undefined ? 'true' : undefined}
        className={chip(activeValue === undefined)}
      >
        Tous
      </Link>

      {options.map(({ value, label }) => (
        <Link
          key={value}
          href={hrefFor(value)}
          aria-current={activeValue === value ? 'true' : undefined}
          className={chip(activeValue === value)}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/** L'état actif n'est pas signalé par la seule couleur : le fond change aussi. */
function chip(isActive: boolean): string {
  return [
    'rounded-xs border px-3 py-1.5 text-2xs tracking-(--tracking-label) uppercase transition-colors',
    isActive
      ? 'border-gold bg-gold text-noir font-semibold'
      : 'border-smoke-2 text-ivory/65 hover:border-gold/50 hover:text-ivory',
  ].join(' ');
}
