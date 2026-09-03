/**
 * ══════════════════════════════════════════════════════════════
 *   CONCIERGERIE WHATSAPP
 * ══════════════════════════════════════════════════════════════
 *
 * Numéro public par nature (affiché aux clients). Surchargeable par
 * environnement via NEXT_PUBLIC_WHATSAPP_PHONE ; à défaut, le numéro réel
 * de la maison. Un numéro de remplacement connu est détecté et signalé,
 * pour qu'un lien de commande qui n'aboutit nulle part ne soit jamais
 * silencieux.
 *
 * NEXT_PUBLIC_ est inclus dans le bundle client : n'y mettre aucun secret.
 */

import type { Product } from './catalog';
import { lowestPrice } from './catalog';
import { formatPrice, formatVolume } from './format';

const DEFAULT_PHONE = '213554276642';
const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || DEFAULT_PHONE;

/** Numéros fictifs utilisés en développement. */
const PLACEHOLDERS = ['213000000000', '213555000000'];

export const whatsappConfigured = PHONE !== '';
export const whatsappIsPlaceholder = PLACEHOLDERS.includes(PHONE);

/** URL wa.me, ou null si aucun numéro n'est configuré. */
export function whatsappUrl(message: string): string | null {
  if (!PHONE) return null;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

/** Message de commande pour un parfum donné. */
export function orderMessage(product: Product): string {
  const variant = product.variants[0];
  const price = formatPrice({ amount: lowestPrice(product), currency: 'DZD' });

  return [
    'Bonjour Maison Dar Safia ✨',
    '',
    'Je souhaite commander le parfum suivant :',
    `• Parfum : ${product.name} (${product.brand.name})`,
    `• Format : ${formatVolume(variant.volumeMl)}`,
    `• Prix : ${price}`,
    '',
    'Merci de me confirmer la disponibilité et la livraison.',
  ].join('\n');
}
