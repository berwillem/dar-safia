'use client';

import { useEffect, useRef } from 'react';

import { useCart } from './CartProvider';
import { lineTotal, type CartLine } from '@/lib/cart/types';
import { formatPrice, formatVolume } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';

/**
 * Tiroir panier.
 *
 * Rendu comme <dialog> natif : le navigateur fournit le piégeage du focus,
 * la fermeture par Échap et l'inertie du fond, qu'une implémentation manuelle
 * reproduit rarement correctement.
 */
export function CartDrawer() {
  const { lines, subtotal, count, isOpen, closeCart, changeQuantity, removeLine, clear } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // La fermeture native (Échap, clic sur le fond) doit remonter dans l'état,
  // sinon le tiroir se rouvrirait au prochain rendu.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => closeCart();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [closeCart]);

  const checkoutUrl = whatsappUrl(buildOrderMessage(lines, subtotal));

  return (
    <dialog
      ref={dialogRef}
      aria-label="Panier"
      // Clic sur le fond : la cible est le <dialog> lui-même, jamais son contenu.
      onClick={(event) => {
        if (event.target === dialogRef.current) closeCart();
      }}
      // Le <dialog> natif ferme déjà sur Échap (événement `close`, géré plus
      // bas). On double la garde ici car, sous certains états de focus, la
      // fermeture native ne se déclenche pas de façon fiable.
      onKeyDown={(event) => {
        if (event.key === 'Escape') closeCart();
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-noir-2 p-0 text-ivory backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-smoke-2 px-5 py-4">
          <h2 className="font-serif text-lg text-ivory">
            Panier
            {count > 0 && (
              <span className="ml-2 text-2xs text-ivory/50 tabular-nums">
                {count} {count > 1 ? 'articles' : 'article'}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="rounded-xs p-1.5 text-ivory/60 transition-colors hover:text-ivory"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-body text-xl text-ivory/60">Votre panier est vide.</p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 rounded-sm border border-gold px-5 py-2.5 text-2xs font-semibold tracking-(--tracking-label) text-gold uppercase transition-colors hover:bg-gold hover:text-noir"
            >
              Continuer la découverte
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-smoke-2 overflow-y-auto">
              {lines.map((line) => (
                <li key={`${line.productSlug}-${line.variantId}`} className="flex gap-3 p-4">
                  {/* Vignette du panier : dérivé déjà optimisé, pas de next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.imageUrl}
                    alt=""
                    width={64}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-16 shrink-0 rounded-xs object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-3xs tracking-(--tracking-label) text-gold uppercase">
                      {line.brandName}
                    </span>
                    <span className="truncate font-serif text-md text-ivory">{line.name}</span>
                    <span className="text-2xs text-ivory/45">
                      {formatVolume(line.volumeMl)}
                    </span>

                    <div className="mt-1.5 flex items-center gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        onStep={(delta) =>
                          changeQuantity(line.productSlug, line.variantId, delta)
                        }
                        label={`Quantité pour ${line.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.productSlug, line.variantId)}
                        className="text-2xs text-ivory/45 underline underline-offset-2 transition-colors hover:text-ivory"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>

                  <span className="shrink-0 font-serif text-md text-gold-light tabular-nums">
                    {formatPrice({ amount: lineTotal(line), currency: line.currency })}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="border-t border-smoke-2 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xs tracking-(--tracking-label) text-ivory/60 uppercase">
                  Sous-total
                </span>
                <span className="font-serif text-xl text-gold-light tabular-nums">
                  {formatPrice({ amount: subtotal, currency: 'DZD' })}
                </span>
              </div>
              <p className="mt-1.5 text-3xs text-ivory/40">
                Livraison et disponibilité confirmées par la conciergerie.
              </p>

              {checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center rounded-sm bg-gold px-6 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
                >
                  Commander sur WhatsApp
                </a>
              ) : (
                <p className="mt-4 rounded-sm border border-smoke-2 px-5 py-3.5 text-center text-2xs text-ivory/50">
                  Commande momentanément indisponible.
                </p>
              )}

              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-2xs text-ivory/40 underline underline-offset-2 transition-colors hover:text-ivory/70"
              >
                Vider le panier
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}

/**
 * Sélecteur de quantité.
 *
 * Émet un ÉCART (+1 / −1) et non une valeur absolue : deux clics rapides
 * liraient sinon la même valeur rendue et perdraient un incrément.
 */
function QuantityStepper({
  value,
  onStep,
  label,
}: {
  value: number;
  onStep: (delta: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center rounded-xs border border-smoke-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label="Diminuer la quantité"
        className="px-2.5 py-1 text-ivory/70 transition-colors hover:text-gold"
      >
        −
      </button>
      <span className="min-w-6 text-center text-2xs tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label="Augmenter la quantité"
        className="px-2.5 py-1 text-ivory/70 transition-colors hover:text-gold"
      >
        +
      </button>
    </div>
  );
}

/** Récapitulatif de commande envoyé à la conciergerie. */
function buildOrderMessage(lines: CartLine[], subtotal: number): string {
  const items = lines.map(
    (line) =>
      `• ${line.name} (${line.brandName}) — ${formatVolume(line.volumeMl)} × ${line.quantity} : ` +
      formatPrice({ amount: lineTotal(line), currency: line.currency })
  );

  return [
    'Bonjour Maison Dar Safia ✨',
    '',
    'Je souhaite finaliser la commande suivante :',
    '',
    ...items,
    '',
    `• SOUS-TOTAL : ${formatPrice({ amount: subtotal, currency: 'DZD' })}`,
    '',
    'Merci de me confirmer la disponibilité et les modalités de livraison.',
  ].join('\n');
}
