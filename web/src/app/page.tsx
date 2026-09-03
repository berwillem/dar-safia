import Link from 'next/link';

import { ProductCard } from '@/components/ProductCard';
import { catalog } from '@/lib/catalog';

/**
 * Accueil.
 *
 * Composant serveur : les données passent par `catalog`, jamais par
 * products.json en direct. Le jour où le repository parlera à Strapi, cette
 * page ne changera pas.
 *
 * Parti pris : éditorial et retenu. Un seul mouvement, à l'ouverture (classe
 * ds-rise, neutralisée sous prefers-reduced-motion). Pas de hero plein écran
 * qui repousserait le reste de la page hors du premier regard.
 */
const PILLARS = [
  {
    title: 'Parfums 100 % originaux',
    body: "Authenticité garantie sur l'ensemble du catalogue, provenance certifiée.",
  },
  {
    title: 'Sillage d’exception',
    body: 'Des concentrations hautes, une présence qui tient sur la peau.',
  },
  {
    title: 'Conciergerie WhatsApp',
    body: 'Conseil personnalisé et commande directe, sept jours sur sept.',
  },
];

export default async function HomePage() {
  const [featured, all, brands] = await Promise.all([
    catalog.listProducts({ featured: true, limit: 8, sort: 'price-desc' }),
    catalog.listProducts(),
    catalog.listBrands(),
  ]);

  return (
    <main id="contenu" tabIndex={-1}>
      {/* ── Ouverture ── */}
      <section className="mx-auto max-w-(--container-site) px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="ds-rise-stagger max-w-3xl">
          <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
            Maison de haute parfumerie · Algérie
          </p>
          <h1 className="mt-5 font-display text-display-lg leading-[1.05] text-balance text-ivory">
            Dar Safia
          </h1>
          <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-ivory/70">
            L&apos;univers des fragrances d&apos;exception et des plus grandes
            signatures olfactives. Sélectionnées une à une, livrées dans les 58
            wilayas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/parfums"
              className="rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
            >
              Explorer la collection
            </Link>
            <Link
              href="/trouver"
              className="rounded-sm border border-smoke-2 px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-ivory/80 uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Trouver votre parfum
            </Link>
          </div>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-smoke-2 pt-8">
          {[
            { label: 'Créations', value: all.total },
            { label: 'Maisons', value: brands.length },
            { label: 'Wilayas livrées', value: 58 },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
                {label}
              </dt>
              <dd className="mt-1 font-serif text-2xl text-gold-light tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── La maison ── */}
      <section
        aria-labelledby="maison"
        className="border-y border-smoke-2 bg-noir-2"
      >
        <div className="mx-auto max-w-(--container-site) px-5 py-16 md:px-8 md:py-20">
          <span className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
            — La maison
          </span>
          <h2
            id="maison"
            className="mt-4 max-w-2xl font-serif text-display-md text-balance text-ivory"
          >
            L&apos;art de la haute parfumerie, à portée de main
          </h2>
          <p className="mt-5 max-w-2xl font-body text-xl leading-relaxed text-ivory/65">
            Née d&apos;une passion pour les sillages nobles, Dar Safia réunit les
            plus grandes créations de la parfumerie mondiale et des extraits
            d&apos;une concentration magistrale. Chaque flacon est retenu selon
            des critères d&apos;exigence : pureté des accords, tenue sur la peau,
            provenance authentique certifiée.
          </p>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="border-t border-gold/30 pt-4">
                <h3 className="font-serif text-lg text-ivory">{pillar.title}</h3>
                <p className="mt-2 text-md leading-relaxed text-ivory/55">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Sélection ── */}
      <section
        aria-labelledby="selection"
        className="mx-auto max-w-(--container-site) px-5 py-16 md:px-8 md:py-20"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-smoke-2 pb-4">
          <h2 id="selection" className="font-serif text-xl text-ivory">
            La sélection
          </h2>
          <Link
            href="/parfums"
            className="text-3xs tracking-(--tracking-label) text-gold uppercase transition-colors hover:text-gold-light"
          >
            Tout voir →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featured.items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* ── Diagnostic ── */}
      <section className="border-t border-smoke-2 bg-noir-2">
        <div className="mx-auto flex max-w-(--container-site) flex-col items-start gap-5 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div className="max-w-lg">
            <span className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
              — Diagnostic olfactif
            </span>
            <h2 className="mt-3 font-serif text-display-sm text-balance text-ivory">
              Quatre questions pour trouver votre signature
            </h2>
          </div>
          <Link
            href="/trouver"
            className="shrink-0 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
          >
            Commencer
          </Link>
        </div>
      </section>
    </main>
  );
}
