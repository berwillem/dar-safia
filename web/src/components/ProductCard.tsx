import Link from 'next/link';

import { lowestPrice, type Product } from '@/lib/catalog';
import { formatFamily, formatGender, formatPrice, formatVolume } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

/**
 * Fiche produit du catalogue.
 *
 * Composant serveur : aucune interactivité, donc aucun JavaScript envoyé.
 * Les bordures logiques (`start`/`end`) suivent le sens de lecture (RTL).
 */
export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const image = product.images[0];
  const variant = product.variants[0];
  const price = { amount: lowestPrice(product), currency: 'DZD' as const };

  return (
    <article
      data-universe={product.family}
      className="group relative flex flex-col overflow-hidden rounded-md border border-smoke-2 bg-noir-2 transition-colors duration-300 hover:border-[var(--universe-glow)]"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-noir-3">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            srcSet={image.srcset ?? undefined}
            sizes="(max-width: 580px) 88vw, (max-width: 1024px) 44vw, 300px"
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-(--ease-lux) group-hover:scale-105"
          />
        )}

        {product.badge && (
          <span className="absolute top-3 start-3 rounded-xs bg-noir/85 px-2.5 py-1 text-3xs font-semibold tracking-(--tracking-label) text-[var(--universe-light)] uppercase backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        <span className="absolute end-3 bottom-3 rounded-xs border border-smoke-2 bg-noir/70 px-2 py-0.5 text-3xs tracking-(--tracking-label) text-ivory-2 uppercase backdrop-blur-sm">
          {formatGender(product.gender, dict)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
            {product.brand.name}
          </span>
          <span className="text-3xs text-ivory/45">
            {formatVolume(variant.volumeMl, locale, dict)}
          </span>
        </div>

        <h3 className="font-serif text-lg leading-tight text-ivory">
          {/* Le lien couvre toute la carte : une seule cible pour l'AT. */}
          <Link
            href={localePath(locale, `/parfums/${product.slug}`)}
            className="after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-2xs text-ivory/50">
          {formatFamily(product.family, dict)}
          {product.notes[0] && ` · ${product.notes[0].note.name}`}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="font-serif text-md text-[var(--universe-light)]">
            {formatPrice(price, locale)}
          </span>
          <span className="text-3xs tracking-(--tracking-label) text-ivory/35 uppercase">
            {dict.common.authentic}
          </span>
        </div>
      </div>
    </article>
  );
}
