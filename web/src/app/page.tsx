import { ProductCard } from '@/components/ProductCard';
import { catalog } from '@/lib/catalog';

/**
 * Accueil.
 *
 * Composant serveur : les données sont lues via `catalog`, jamais depuis
 * products.json directement. Le jour où le repository parlera à Strapi, cette
 * page ne changera pas d'une ligne.
 *
 * Cette page est le premier jalon de la phase 2 — elle prouve que la couture
 * fonctionne de bout en bout. La mise en scène cinématique de l'accueil
 * (hero, storytelling, univers) reste à porter.
 */
export default async function HomePage() {
  const [featured, all] = await Promise.all([
    catalog.listProducts({ featured: true, limit: 8, sort: 'price-desc' }),
    catalog.listProducts(),
  ]);

  const brands = await catalog.listBrands();

  return (
    <main id="contenu" tabIndex={-1}>
      {/* ── Ouverture ── */}
      <section className="mx-auto max-w-(--container-site) px-5 pt-20 pb-14 md:px-8 md:pt-28">
        <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
          Maison de haute parfumerie
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-display-lg leading-[1.05] text-balance text-ivory">
          Dar Safia
        </h1>
        <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-ivory/70">
          Parfums niche et signatures d&apos;exception, choisis un à un. Livraison
          dans les 58 wilayas.
        </p>

        <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-smoke-2 pt-8">
          <div>
            <dt className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
              Créations
            </dt>
            <dd className="mt-1 font-serif text-2xl text-gold-light tabular-nums">
              {all.total}
            </dd>
          </div>
          <div>
            <dt className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
              Maisons
            </dt>
            <dd className="mt-1 font-serif text-2xl text-gold-light tabular-nums">
              {brands.length}
            </dd>
          </div>
          <div>
            <dt className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
              Wilayas livrées
            </dt>
            <dd className="mt-1 font-serif text-2xl text-gold-light tabular-nums">58</dd>
          </div>
        </dl>
      </section>

      {/* ── Sélection ── */}
      <section className="mx-auto max-w-(--container-site) px-5 pb-24 md:px-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-smoke-2 pb-4">
          <h2 className="font-serif text-xl text-ivory">La sélection</h2>
          <span className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
            {featured.items.length} créations
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featured.items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
