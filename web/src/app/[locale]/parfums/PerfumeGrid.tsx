import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';

import type { ShopProduct } from './shop-product';

/** `ShopProduct` (forme aplatie côté client) → la forme que `ProductCard` attend. */
function toCardData(product: ShopProduct): ProductCardData {
  return {
    slug: product.slug,
    name: product.name,
    gender: product.gender,
    family: product.family,
    badge: product.badge,
    brand: product.brand,
    images: product.image ? [product.image] : [],
    notes: product.headlineNote ? [{ note: { name: product.headlineNote } }] : [],
    variants: [
      {
        id: product.slug,
        volumeMl: product.volumeMl,
        price: { amount: product.priceFrom, currency: 'DZD' },
        stock: 0,
      },
    ],
  };
}

export function PerfumeGrid({
  products,
  locale,
  dict,
}: {
  products: ShopProduct[];
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={toCardData(product)}
          locale={locale}
          dict={dict}
        />
      ))}
    </div>
  );
}
