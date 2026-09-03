'use client';

import { useCart } from './CartProvider';

/**
 * Déclencheur du panier, avec compteur.
 *
 * Le compteur n'est rendu qu'après hydratation : afficher 0 au rendu serveur
 * puis 3 au montage provoquerait une divergence d'hydratation et un
 * clignotement. On réserve donc l'espace sans afficher de valeur.
 */
export function CartButton() {
  const { count, hydrated, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={
        hydrated && count > 0
          ? `Panier, ${count} ${count > 1 ? 'articles' : 'article'}`
          : 'Panier'
      }
      className="relative rounded-xs p-2 text-ivory/75 transition-colors hover:text-gold"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {hydrated && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-3xs font-bold text-noir tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
