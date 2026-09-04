'use client';

import { useEffect, useRef } from 'react';

import { useI18n } from '@/components/i18n/I18nProvider';
import { lineTotal, type CartLine } from '@/lib/cart/types';
import type { Dictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';
import { formatPrice, formatVolume } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';

import { useCart } from './CartProvider';

/**
 * Tiroir panier.
 *
 * Rendu comme <dialog> natif : le navigateur fournit le piégeage du focus et
 * l'inertie du fond. La fermeture par Échap est doublée d'un handler explicite.
 */
export function CartDrawer() {
  const { lines, subtotal, count, isOpen, closeCart, changeQuantity, removeLine, clear } = useCart();
  const { locale, dict, fill } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => closeCart();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [closeCart]);

  const checkoutUrl = whatsappUrl(buildOrderMessage(lines, subtotal, locale, dict, fill));

  return (
    <dialog
      ref={dialogRef}
      aria-label={dict.cart.title}
      onClick={(event) => {
        if (event.target === dialogRef.current) closeCart();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') closeCart();
      }}
      className="m-0 ms-auto h-dvh max-h-dvh w-full max-w-md bg-noir-2 p-0 text-ivory backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-smoke-2 px-5 py-4">
          <h2 className="font-serif text-lg text-ivory">
            {dict.cart.title}
            {count > 0 && (
              <span className="ms-2 text-2xs text-ivory/50 tabular-nums">
                {fill(dict.cart.items, { count })}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label={dict.cart.close}
            className="rounded-xs p-1.5 text-ivory/60 transition-colors hover:text-ivory"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-body text-xl text-ivory/60">{dict.cart.empty}</p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 rounded-sm border border-gold px-5 py-2.5 text-2xs font-semibold tracking-(--tracking-label) text-gold uppercase transition-colors hover:bg-gold hover:text-noir"
            >
              {dict.cart.continue}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-smoke-2 overflow-y-auto">
              {lines.map((line) => (
                <li key={`${line.productSlug}-${line.variantId}`} className="flex gap-3 p-4">
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
                      {formatVolume(line.volumeMl, locale, dict)}
                    </span>

                    <div className="mt-1.5 flex items-center gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        onStep={(delta) =>
                          changeQuantity(line.productSlug, line.variantId, delta)
                        }
                        label={fill(dict.cart.quantityFor, { name: line.name })}
                        decreaseLabel={dict.cart.decrease}
                        increaseLabel={dict.cart.increase}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.productSlug, line.variantId)}
                        className="text-2xs text-ivory/45 underline underline-offset-2 transition-colors hover:text-ivory"
                      >
                        {dict.cart.remove}
                      </button>
                    </div>
                  </div>

                  <span className="shrink-0 font-serif text-md text-gold-light tabular-nums">
                    {formatPrice({ amount: lineTotal(line), currency: line.currency }, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="border-t border-smoke-2 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xs tracking-(--tracking-label) text-ivory/60 uppercase">
                  {dict.cart.subtotal}
                </span>
                <span className="font-serif text-xl text-gold-light tabular-nums">
                  {formatPrice({ amount: subtotal, currency: 'DZD' }, locale)}
                </span>
              </div>
              <p className="mt-1.5 text-3xs text-ivory/40">{dict.cart.deliveryNote}</p>

              {checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center rounded-sm bg-gold px-6 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
                >
                  {dict.cart.checkout}
                </a>
              ) : (
                <p className="mt-4 rounded-sm border border-smoke-2 px-5 py-3.5 text-center text-2xs text-ivory/50">
                  {dict.cart.unavailable}
                </p>
              )}

              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-2xs text-ivory/40 underline underline-offset-2 transition-colors hover:text-ivory/70"
              >
                {dict.cart.clear}
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}

function QuantityStepper({
  value,
  onStep,
  label,
  decreaseLabel,
  increaseLabel,
}: {
  value: number;
  onStep: (delta: number) => void;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  return (
    <div className="flex items-center rounded-xs border border-smoke-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label={decreaseLabel}
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
        aria-label={increaseLabel}
        className="px-2.5 py-1 text-ivory/70 transition-colors hover:text-gold"
      >
        +
      </button>
    </div>
  );
}

/** Récapitulatif de commande envoyé à la conciergerie. */
function buildOrderMessage(
  lines: CartLine[],
  subtotal: number,
  locale: Locale,
  dict: Dictionary,
  fill: (t: string, p?: Record<string, string | number>) => string
): string {
  const items = lines.map((line) =>
    `• ${fill(dict.cart.orderLine, {
      name: line.name,
      brand: line.brandName,
      volume: formatVolume(line.volumeMl, locale, dict),
      qty: line.quantity,
      total: formatPrice({ amount: lineTotal(line), currency: line.currency }, locale),
    })}`
  );

  return [
    dict.common.orderGreeting,
    '',
    dict.cart.orderIntro,
    '',
    ...items,
    '',
    `• ${fill(dict.cart.orderSubtotal, {
      subtotal: formatPrice({ amount: subtotal, currency: 'DZD' }, locale),
    })}`,
    '',
    dict.cart.orderOutro,
  ].join('\n');
}
