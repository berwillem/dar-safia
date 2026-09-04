/**
 * ══════════════════════════════════════════════════════════════
 *   CONCIERGERIE WHATSAPP
 * ══════════════════════════════════════════════════════════════
 *
 * Numéro public par nature (affiché aux clients). Surchargeable via
 * NEXT_PUBLIC_WHATSAPP_PHONE ; à défaut, le numéro réel de la maison. Un
 * numéro de remplacement connu est détecté et signalé.
 *
 * NEXT_PUBLIC_ est inclus dans le bundle client : n'y mettre aucun secret.
 */

import type { Product } from './catalog';
import { lowestPrice } from './catalog';
import { formatPrice, formatVolume } from './format';
import type { Locale } from './i18n/config';
import { interpolate, type Dictionary } from './i18n/dictionary';

const DEFAULT_PHONE = '213554276642';
const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || DEFAULT_PHONE;

/** Numéros fictifs utilisés en développement. */
const PLACEHOLDERS = ['213000000000', '213555000000'];

export const whatsappConfigured = PHONE !== '';
export const whatsappIsPlaceholder = PLACEHOLDERS.includes(PHONE);

/** Numéro brut (chiffres, indicatif compris), ou chaîne vide si non configuré. */
export const whatsappPhone = PHONE;

/** URL wa.me, ou null si aucun numéro n'est configuré. */
export function whatsappUrl(message: string): string | null {
  if (!PHONE) return null;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Forme lisible du numéro : « +213 554 27 66 42 ». Regroupe l'indicatif (3
 * chiffres) puis le reste en 3-2-2-2. Retombe sur « +<chiffres> » si le
 * découpage ne s'applique pas.
 */
export function formatWhatsappPhone(phone: string = PHONE): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const rest = digits.slice(3);
  const grouped = rest.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  return `+${digits.slice(0, 3)} ${grouped}`.trim();
}

/** Message de commande pour un parfum donné. */
export function orderMessage(
  product: Product,
  locale: Locale,
  dict: Dictionary
): string {
  const variant = product.variants[0];
  const price = formatPrice({ amount: lowestPrice(product), currency: 'DZD' }, locale);

  return [
    dict.common.orderGreeting,
    '',
    interpolate(dict.common.orderProduct, {
      name: product.name,
      brand: product.brand.name,
    }),
    interpolate(dict.common.orderVolume, {
      volume: formatVolume(variant.volumeMl, locale, dict),
    }),
    interpolate(dict.common.orderPrice, { price }),
    '',
    dict.cart.orderOutro,
  ].join('\n');
}
