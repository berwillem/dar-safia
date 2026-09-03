import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { OlfactoryPyramid } from '@/components/OlfactoryPyramid';
import { ProductCard } from '@/components/ProductCard';
import { catalog, lowestPrice } from '@/lib/catalog';
import {
  formatFamily,
  formatGender,
  formatLongevity,
  formatPrice,
  formatSillage,
  formatVolume,
} from '@/lib/format';
import { orderMessage, whatsappUrl } from '@/lib/whatsapp';

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Fiche produit.
 *
 * Prégénérée pour les 45 parfums : aucune requête au chargement, et le HTML
 * est complet pour les moteurs de recherche — l'ancien site rendait la fiche
 * en JavaScript depuis un fragment d'URL (#product-12), invisible au crawl.
 */
export async function generateStaticParams() {
  const { items } = await catalog.listProducts();
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0];

  return {
    title: product.seo?.title ?? `${product.name} — ${product.brand.name}`,
    description: product.seo?.description ?? product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} — ${product.brand.name}`,
      description: product.description.slice(0, 155),
      type: 'website',
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);

  if (!product) notFound();

  const related = await catalog.getRelatedProducts(slug, 4);
  const image = product.images[0];
  const variant = product.variants[0];
  const price = { amount: lowestPrice(product), currency: 'DZD' as const };
  const orderUrl = whatsappUrl(orderMessage(product));

  // Seules les mesures réellement connues sont affichées.
  const metrics = [
    { label: 'Tenue', value: formatLongevity(product.longevityHours) },
    { label: 'Sillage', value: formatSillage(product.sillage) },
    { label: 'Famille', value: formatFamily(product.family) },
  ].filter((m): m is { label: string; value: string } => m.value !== null);

  /**
   * Données structurées : elles permettent aux moteurs d'afficher prix et
   * disponibilité. `offers` reflète le stock réel — pas d'InStock affirmé
   * par défaut comme le faisait l'ancien site sur toutes les fiches.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand.name },
    description: product.description,
    image: image ? [image.url] : undefined,
    offers: {
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: price.currency,
      availability:
        variant.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
    },
  };

  return (
    <main id="contenu" tabIndex={-1} data-universe={product.family}>
      <script
        type="application/ld+json"
        // Contenu généré par nous à partir de données du catalogue, pas d'une
        // saisie utilisateur ; JSON.stringify échappe les guillemets.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Atmosphère : dégradé teinté par l'univers de la famille olfactive. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 70% 0%, var(--universe-glow) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-(--container-site) px-5 py-10 md:px-8 md:py-14">
        <nav aria-label="Fil d'Ariane" className="text-2xs text-ivory/45">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gold">Accueil</Link>
            </li>
            <li aria-hidden="true">◆</li>
            <li>
              <Link href="/parfums" className="hover:text-gold">Parfums</Link>
            </li>
            <li aria-hidden="true">◆</li>
            <li className="text-ivory/70" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          {/* ── Visuel ── */}
          <div>
            <div
              className="overflow-hidden rounded-md border border-smoke-2 bg-noir-2"
              style={{ boxShadow: '0 24px 60px -24px var(--universe-glow)' }}
            >
              {image && (
                /* Voir ProductCard : dérivés déjà optimisés par le pipeline. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  srcSet={image.srcset ?? undefined}
                  sizes="(max-width: 1024px) 92vw, 520px"
                  alt={image.alt}
                  // Image principale de la page : jamais en lazy, c'est le LCP.
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-4/5 w-full object-cover"
                />
              )}
            </div>

            {/* ── Mesures ──
                Une mesure absente n'est pas affichée : mieux vaut deux
                colonnes justes que trois dont une inventée. */}
            <dl
              className="mt-4 grid gap-px overflow-hidden rounded-md border border-smoke-2 bg-smoke-2"
              style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
            >
              {metrics.map(({ label, value }) => (
                <div key={label} className="bg-noir-2 px-3 py-4 text-center">
                  <dt className="text-3xs tracking-(--tracking-label) text-ivory/40 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1.5 font-serif text-md text-[var(--universe-light)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Informations ── */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
                {product.brand.name}
              </span>
              <span className="rounded-xs border border-smoke-2 px-2 py-0.5 text-3xs tracking-(--tracking-label) text-ivory/60 uppercase">
                {formatGender(product.gender)}
              </span>
              {product.concentration && (
                <span className="text-3xs text-ivory/45">{product.concentration}</span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-display-md leading-tight text-balance text-ivory">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-y border-smoke-2 py-5">
              <span className="font-serif text-2xl text-[var(--universe-light)] tabular-nums">
                {formatPrice(price)}
              </span>
              <span className="text-2xs text-ivory/50">
                {formatVolume(variant.volumeMl)}
              </span>
              {/* Le stock vient des données ; on n'affirme pas « En Stock »
                  comme le faisait l'ancien site sur toutes les fiches. */}
              <span className="ml-auto text-2xs text-ivory/50">
                {variant.stock > 0
                  ? `${variant.stock} en stock`
                  : 'Sur commande — délai confirmé par la conciergerie'}
              </span>
            </div>

            <p className="mt-6 font-body text-xl leading-relaxed text-ivory/80">
              {product.description}
            </p>

            {orderUrl ? (
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors duration-200 hover:bg-gold-light"
              >
                Commander sur WhatsApp
              </a>
            ) : (
              <p className="mt-8 rounded-sm border border-smoke-2 px-5 py-3.5 text-sm text-ivory/50">
                Commande momentanément indisponible.
              </p>
            )}

            <OlfactoryPyramid notes={product.notes} />

            {product.story && (
              <section aria-labelledby="histoire" className="mt-14">
                <h2 id="histoire" className="font-serif text-xl text-ivory">
                  L&apos;histoire du flacon
                </h2>
                <p className="mt-4 font-body text-xl leading-relaxed text-ivory/70">
                  {product.story}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* ── Suggestions ── */}
        {related.length > 0 && (
          <section aria-labelledby="similaires" className="mt-24">
            <h2
              id="similaires"
              className="border-b border-smoke-2 pb-4 font-serif text-xl text-ivory"
            >
              Dans la même famille
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
