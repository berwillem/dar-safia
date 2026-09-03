'use client';

import { useCart } from './CartProvider';
import type { CartLine } from '@/lib/cart/types';

/**
 * Bouton d'ajout au panier.
 *
 * Reçoit un instantané déjà construit côté serveur plutôt qu'un objet Product
 * complet : cela évite de sérialiser 45 champs (histoire, notes, SEO) vers le
 * client pour n'en afficher que cinq.
 */
export function AddToCartButton({
  line,
  className,
  label = 'Ajouter au panier',
}: {
  line: Omit<CartLine, 'quantity'>;
  className?: string;
  label?: string;
}) {
  const { addLine } = useCart();

  return (
    <button
      type="button"
      onClick={() => addLine(line)}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-sm border border-smoke-2 px-6 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-ivory uppercase transition-colors duration-200 hover:border-gold hover:text-gold'
      }
    >
      {label}
    </button>
  );
}
