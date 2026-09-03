'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import * as store from '@/lib/cart/store';
import { cartCount, cartSubtotal, type CartLine } from '@/lib/cart/types';

/**
 * Accès au panier.
 *
 * Le contenu vient de useSyncExternalStore (voir lib/cart/store.ts) : c'est
 * localStorage qui fait autorité, pas un état React. Seule l'ouverture du
 * tiroir est un état local — elle n'a aucune raison d'être persistée.
 *
 * Le provider est monté dans le layout mais n'englobe que du contexte : les
 * pages qu'il reçoit en children restent des composants serveur.
 */

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** false pendant le rendu serveur et jusqu'à l'hydratation. */
  hydrated: boolean;
  isOpen: boolean;

  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (productSlug: string, variantId: string, quantity: number) => void;
  /** Écart relatif — sûr face à des clics rapides. Voir store.changeQuantity. */
  changeQuantity: (productSlug: string, variantId: string, delta: number) => void;
  removeLine: (productSlug: string, variantId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  // Même mécanisme pour savoir si l'on est hydraté : renvoie false au rendu
  // serveur, true côté client, sans setState dans un effet.
  const hydrated = useSyncExternalStore(
    store.subscribe,
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity = 1) => {
      store.addLine(line, quantity);
      setIsOpen(true);
    },
    []
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      hydrated,
      isOpen,
      addLine,
      setQuantity: store.setQuantity,
      changeQuantity: store.changeQuantity,
      removeLine: store.removeLine,
      clear: store.clear,
      openCart,
      closeCart,
    }),
    [lines, hydrated, isOpen, addLine, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un <CartProvider>.');
  }
  return context;
}
