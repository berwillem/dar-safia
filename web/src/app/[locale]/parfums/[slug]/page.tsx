import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { OlfactoryPyramid } from '@/components/OlfactoryPyramid';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { catalog, lowestPrice } from '@/lib/catalog';
import {
  formatFamily,
  formatGender,
  formatLongevity,
  formatPrice,
  formatSillage,
  formatVolume,
} from '@/lib/format';
import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary, interpolate } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/routing';
import { orderMessage, whatsappUrl } from '@/lib/whatsapp';

/**
 * Fiche produit. Prégénérée pour chaque parfum × chaque langue : HTML complet,
 * indexable — l'ancien site rendait la fiche en JavaScript depuis un fragment
 * d'URL, invisible au crawl.
 *
 * NB : le CONTENU du parfum (nom, description, notes) reste en français ; sa
 * traduction relèvera de l'i18n Strapi. Seule l'interface est multilingue.
 */
export async function generateStaticParams() {
  const { items } = await catalog.listProducts();
  return LOCALES.flatMap((locale) =>
    items.map((product) => ({ locale, slug: product.slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/parfums/[slug]'>): Promise<Metadata> {
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

export default async function ProductPage({
  params,
}: PageProps<'/[locale]/parfums/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, product] = await Promise.all([
    getDictionary(locale),
    catalog.getProductBySlug(slug),
  ]);
  if (!product) notFound();

  const related = await catalog.getRelatedProducts(slug, 4);
  const p = dict.product;
  const image = product.images[0];
  const variant = product.variants[0];
  const price = { amount: lowestPrice(product), currency: 'DZD' as const };
  const orderUrl = whatsappUrl(orderMessage(product, locale, dict));

  const metrics = [
    { label: p.metrics.longevity, value: formatLongevity(product.longevityHours, dict) },
    { label: p.metrics.sillage, value: formatSillage(product.sillage, dict) },
    { label: p.metrics.family, value: formatFamily(product.family, dict) },
  ].filter((m): m is { label: string; value: string } => m.value !== null);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 70% 0%, var(--universe-glow) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-(--container-site) px-5 pt-28 pb-10 md:px-8 md:pt-32 md:pb-14">
        <nav aria-label="breadcrumb" className="text-2xs text-ivory/45">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={localePath(locale, '/')} className="hover:text-gold">
                {p.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">◆</li>
            <li>
              <Link href={localePath(locale, '/parfums')} className="hover:text-gold">
                {p.breadcrumbCatalog}
              </Link>
            </li>
            <li aria-hidden="true">◆</li>
            <li className="text-ivory/70" aria-current="page">
              {product.name}
            </li>
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  srcSet={image.srcset ?? undefined}
                  sizes="(max-width: 1024px) 92vw, 520px"
                  alt={image.alt}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-4/5 w-full object-cover"
                />
              )}
            </div>

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
                {formatGender(product.gender, dict)}
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
                {formatPrice(price, locale)}
              </span>
              <span className="text-2xs text-ivory/50">
                {formatVolume(variant.volumeMl, locale, dict)}
              </span>
              <span className="ms-auto text-2xs text-ivory/50">
                {variant.stock > 0
                  ? interpolate(p.inStock, { count: variant.stock })
                  : p.onOrder}
              </span>
            </div>

            <p className="mt-6 font-body text-xl leading-relaxed text-ivory/80">
              {product.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {orderUrl ? (
                <a
                  href={orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors duration-200 hover:bg-gold-light"
                >
                  {p.order}
                </a>
              ) : (
                <p className="rounded-sm border border-smoke-2 px-5 py-3.5 text-sm text-ivory/50">
                  {p.orderUnavailable}
                </p>
              )}

              <AddToCartButton
                line={{
                  productSlug: product.slug,
                  variantId: variant.id,
                  name: product.name,
                  brandName: product.brand.name,
                  imageUrl: image?.url ?? '',
                  volumeMl: variant.volumeMl,
                  unitPrice: price.amount,
                  currency: 'DZD',
                }}
              />
            </div>

            <OlfactoryPyramid notes={product.notes} dict={dict} />

            {product.story && (
              <section aria-labelledby="histoire" className="mt-14">
                <h2 id="histoire" className="font-serif text-xl text-ivory">
                  {p.storyTitle}
                </h2>
                <p className="mt-4 font-body text-xl leading-relaxed text-ivory/70">
                  {product.story}
                </p>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="similaires" className="mt-24">
            <h2
              id="similaires"
              className="border-b border-smoke-2 pb-4 font-serif text-xl text-ivory"
            >
              {p.relatedTitle}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
